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
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { read } from "@/orpc/routes/system/routes/system.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { call } from "@orpc/server";
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
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $factoryImplementation: String!
    $tokenImplementation: String!
    $name: String!
  ) {
    IATKTokenFactoryRegistryRegisterTokenFactory(
      challengeId: $challengeId
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
 */
export const factoryCreate = systemRouter.system.tokenFactoryCreate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.tokenFactoryCreate,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { factories, walletVerification } = input;
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
    const factoryCreateErrors: string[] = [];

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

        // Execute the factory creation transaction
        const variables = {
          address: tokenFactoryRegistry,
          from: sender.wallet,
          factoryImplementation: factoryImplementation,
          tokenImplementation: tokenImplementation,
          name: name,
        };

        // Use the Portal client's mutate method that returns the transaction hash
        await context.portalClient.mutate(
          CREATE_TOKEN_FACTORY_MUTATION,
          variables,
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        );

        logger.info(`Factory ${name} deployed successfully`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Failed to create factory ${name}:`, error);
        factoryCreateErrors.push(
          `Failed to create factory ${name}: ${errorMessage}`
        );
      }
    }

    if (factoryCreateErrors.length > 0) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: factoryCreateErrors.join("\n"),
      });
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
