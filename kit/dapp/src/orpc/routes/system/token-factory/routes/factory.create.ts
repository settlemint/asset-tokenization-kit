/**
 * Token Factory Creation Handler
 *
 * This handler creates token factory contracts through the ATKSystemImplementation.
 * It supports creating factories for different asset types (bond, equity, fund,
 * stablecoin, deposit) either individually or in batch.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Processes factory creation requests (single or batch)
 * 3. Executes transactions via Portal GraphQL
 * 4. Returns a summary of all created factories
 * @see {@link ./factory.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { read } from "@/orpc/routes/system/routes/system.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { call } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { getDefaultImplementations } from "./factory.create.schema";

const logger = createLogger();

/**
 * GraphQL mutation for creating a token factory.
 * @param address - The token factory registry contract address to call
 * @param from - The wallet address initiating the transaction
 * @param _factoryImplementation - The factory implementation address
 * @param _tokenImplementation - The token implementation address
 * @param _name - The name for the token factory
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_TOKEN_FACTORY_MUTATION = portalGraphql(`
  mutation CreateTokenFactory(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $from: String!
    $factoryImplementation: String!
    $tokenImplementation: String!
    $name: String!
  ) {
    IATKTokenFactoryRegistryRegisterTokenFactory(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: {
        factoryImplementation: $factoryImplementation
        name: $name
        tokenImplementation: $tokenImplementation
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Creates token factory contracts.
 *
 * This handler creates token factories, supporting both single and batch operations.
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client
 * @middleware theGraphMiddleware - Provides TheGraph client
 * @param input.factories - Single factory or array of factories to create
 * @param input.messages - Optional custom messages for localization
 * @returns {Promise<FactoryCreateOutput>} Creation summary with results for each factory
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system not bootstrapped or transaction fails
 */
export const factoryCreate = portalRouter.system.tokenFactoryCreate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.tokenFactoryCreate,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { factories, verification } = input;
    const sender = context.auth.user;
    const { system } = context;

    if (!system.tokenFactoryRegistry) {
      const cause = new Error("Token factory registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // Store registry address to satisfy TypeScript's null checks
    const tokenFactoryRegistry = system.tokenFactoryRegistry;

    // Normalize to array
    const factoryList = Array.isArray(factories) ? factories : [factories];

    // Query existing token factories using the ORPC client
    let existingFactoryNames = new Set<string>();
    try {
      const systemData = context.system;

      existingFactoryNames = new Set(
        systemData.tokenFactories.map((factory) => factory.name.toLowerCase())
      );
    } catch (error) {
      // If we can't fetch existing factories, proceed anyway
      // The contract will reject duplicates
      logger.debug(`Could not fetch existing factories: ${String(error)}`);
    }

    // Filter out existing factories
    const factoriesToDeploy = factoryList.filter(
      (factory) => !existingFactoryNames.has(factory.name.toLowerCase())
    );

    // Process factories sequentially - parallel challenge generation not working
    const results = [];

    for (const factory of factoriesToDeploy) {
      const { type, name } = factory;
      const defaults = getDefaultImplementations(type);

      // Use provided implementations or fall back to defaults for asset type
      const factoryImplementation =
        factory.factoryImplementation ?? defaults.factoryImplementation;
      const tokenImplementation =
        factory.tokenImplementation ?? defaults.tokenImplementation;

      try {
        // Generate a fresh challenge response for each factory
        const challengeResponse = await handleChallenge(sender, {
          code: verification.verificationCode,
          type: verification.verificationType,
        });

        // Execute the factory creation transaction
        const variables: VariablesOf<typeof CREATE_TOKEN_FACTORY_MUTATION> = {
          address: tokenFactoryRegistry,
          from: sender.wallet,
          factoryImplementation: factoryImplementation,
          tokenImplementation: tokenImplementation,
          name: name,
          ...challengeResponse,
        };

        // Use the Portal client's mutate method that returns the transaction hash
        const txHash = await context.portalClient.mutate(
          CREATE_TOKEN_FACTORY_MUTATION,
          variables
        );

        results.push({ status: "success" as const, factory: name, txHash });
        logger.info(`Factory ${name} deployed successfully`);
      } catch (error) {
        logger.error(`Failed to create factory ${name}:`, error);
        results.push({ status: "failed" as const, factory: name, error });
      }
    }

    const updatedSystemDetails = await call(
      read,
      {
        id: context.system.address,
      },
      { context }
    );

    // Return the complete system details
    return updatedSystemDetails;
  });
