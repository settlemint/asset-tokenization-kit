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
import { TOKEN_FACTORY_PERMISSIONS } from "@/orpc/routes/token/routes/factory/factory.permissions";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import {
  type FactoryCreateOutput,
  getDefaultImplementations,
} from "./factory.create.schema";

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
export const factoryCreate = portalRouter.token.factoryCreate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: TOKEN_FACTORY_PERMISSIONS.create,
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { factories, verification } = input;
    const sender = context.auth.user;
    const { t, system } = context;

    if (!system.tokenFactoryRegistry) {
      const cause = new Error("Token factory registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // Normalize to array
    const factoryList = Array.isArray(factories) ? factories : [factories];
    const totalFactories = factoryList.length;

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

    const results: FactoryCreateOutput["results"] = [];

    // Process each factory using a generator pattern for batch operations
    for (const factory of factoryList) {
      const { type, name } = factory;
      const defaults = getDefaultImplementations(type);

      // Use provided implementations or fall back to defaults for asset type
      const factoryImplementation =
        factory.factoryImplementation ?? defaults.factoryImplementation;
      const tokenImplementation =
        factory.tokenImplementation ?? defaults.tokenImplementation;

      // For single factory, use specific message. For batch, use progress

      // Check if factory already exists
      if (existingFactoryNames.has(name.toLowerCase())) {
        results.push({
          type,
          name,
          transactionHash: "",
          error: t("tokens:api.factory.create.messages.alreadyExists"),
        });

        continue; // Skip to next factory
      }

      try {
        // Every request needs a challenge response (can only be used once)
        const challengeResponse = await handleChallenge(sender, {
          code: verification.verificationCode,
          type: verification.verificationType,
        });

        // Execute the factory creation transaction (reuse challenge response)
        const variables: VariablesOf<typeof CREATE_TOKEN_FACTORY_MUTATION> = {
          address: system.tokenFactoryRegistry,
          from: sender.wallet,
          factoryImplementation: factoryImplementation,
          tokenImplementation: tokenImplementation,
          name: name,
          ...challengeResponse,
        };

        // Use the Portal client's mutate method that returns the transaction hash
        const transactionHash = await context.portalClient.mutate(
          CREATE_TOKEN_FACTORY_MUTATION,
          variables
        );

        results.push({
          type,
          name,
          transactionHash,
        });
      } catch (error) {
        results.push({
          type,
          name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Final completion message
    const successCount = results.filter((r) => !r.error).length;
    const skippedCount = results.filter(
      (r) => r.error === t("tokens:api.factory.create.messages.alreadyExists")
    ).length;
    const failureCount = results.filter(
      (r) =>
        r.error &&
        r.error !== t("tokens:api.factory.create.messages.alreadyExists")
    ).length;

    let completionMessage = t("tokens:api.factory.create.messages.completed");

    // All succeeded
    if (successCount > 0 && failureCount === 0 && skippedCount === 0) {
      completionMessage = t("tokens:api.factory.create.messages.allSucceeded", {
        count: successCount,
      });
    }
    // All skipped
    else if (skippedCount > 0 && successCount === 0 && failureCount === 0) {
      completionMessage = t("tokens:api.factory.create.messages.allSkipped", {
        count: skippedCount,
      });
    }
    // All failed
    else if (failureCount > 0 && successCount === 0 && skippedCount === 0) {
      completionMessage = t("tokens:api.factory.create.messages.batchFailed", {
        count: failureCount,
      });
    }
    // Mixed results with all three types
    else if (successCount > 0 && skippedCount > 0 && failureCount > 0) {
      completionMessage = t("tokens:api.factory.create.messages.mixedResults", {
        successCount,
        skippedCount,
        failureCount,
      });
    }
    // Success and skipped only
    else if (successCount > 0 && skippedCount > 0 && failureCount === 0) {
      completionMessage = t(
        "tokens:api.factory.create.messages.successAndSkipped",
        {
          successCount,
          skippedCount,
        }
      );
    }
    // Success and failed only
    else if (successCount > 0 && failureCount > 0 && skippedCount === 0) {
      completionMessage = t(
        "tokens:api.factory.create.messages.successAndFailed",
        {
          successCount,
          failureCount,
        }
      );
    }
    // Skipped and failed only
    else if (skippedCount > 0 && failureCount > 0 && successCount === 0) {
      completionMessage = t(
        "tokens:api.factory.create.messages.skippedAndFailed",
        {
          skippedCount,
          failureCount,
        }
      );
    }

    return {
      status: "completed" as const,
      message: completionMessage,
      results,
      result: results, // Added for useStreamingMutation hook compatibility
      progress: {
        current: totalFactories,
        total: totalFactories,
      },
    };
  });
