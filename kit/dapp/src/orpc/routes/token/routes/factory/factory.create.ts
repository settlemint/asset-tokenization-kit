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
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
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
 * @param input.contract - The token factory registry contract address
 * @param input.factories - Single factory or array of factories to create
 * @param input.messages - Optional custom messages for localization
 * @returns {Promise<FactoryCreateOutput>} Creation summary with results for each factory
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system not bootstrapped or transaction fails
 * @example
 * ```typescript
 * // Create a single bond factory
 * const result = await client.tokens.factoryCreate({
 *   contract: "0x123...",
 *   factories: {
 *     type: "bond",
 *     name: "Corporate Bonds"
 *   }
 * });
 *
 * // Create multiple factories
 * const result = await client.tokens.factoryCreate({
 *   contract: "0x123...",
 *   factories: [
 *     { type: "bond", name: "Corporate Bonds" },
 *     { type: "equity", name: "Common Stock" }
 *   ]
 * });
 * const successful = result.results.filter(r => !r.error).length;
 * console.log(`Created ${successful} factories`);
 * ```
 */
export const factoryCreate = onboardedRouter.token.factoryCreate
  .use(permissionsMiddleware({ system: ["create"] }))
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .use(systemMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { contract, factories, verification } = input;
    const sender = context.auth.user;
    // const { t } = context; // Removed - using hardcoded messages

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

    /**
     * Checks if an error contains a specific pattern
     * @param error
     * @param pattern
     */
    function containsErrorPattern(error: unknown, pattern: string): boolean {
      if (error instanceof Error) {
        return (
          error.message.includes(pattern) ||
          (error.stack?.includes(pattern) ?? false)
        );
      }
      if (typeof error === "string") {
        return error.includes(pattern);
      }
      return false;
    }

    // Handle challenge once for all factory creations
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

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
          error: "Factory already exists",
        });

        continue; // Skip to next factory
      }

      try {
        // Execute the factory creation transaction (reuse challenge response)
        const variables: VariablesOf<typeof CREATE_TOKEN_FACTORY_MUTATION> = {
          address: contract,
          from: sender.wallet,
          factoryImplementation: factoryImplementation,
          tokenImplementation: tokenImplementation,
          name: name,
          ...challengeResponse,
        };

        // Use the Portal client's mutate method that returns the transaction hash
        const transactionHash = await context.portalClient.mutate(
          CREATE_TOKEN_FACTORY_MUTATION,
          variables,
          `Failed to create factory: ${name}`
        );

        results.push({
          type,
          name,
          transactionHash,
        });
      } catch (error) {
        // Check for specific error types
        let errorMessage = "Factory creation failed";
        let errorDetail = "Factory creation failed";

        if (error instanceof Error) {
          errorDetail = error.message;
          // Check for SystemNotBootstrapped error
          if (containsErrorPattern(error, "SystemNotBootstrapped")) {
            errorMessage = "System is not bootstrapped";
            // For critical errors like system not bootstrapped, throw proper error
            throw errors.INTERNAL_SERVER_ERROR({
              message: errorMessage,
              cause: new Error(errorDetail),
            });
          }
        }

        results.push({
          type,
          name,
          error: errorDetail,
        });
      }
    }

    // Final completion message
    const successCount = results.filter((r) => !r.error).length;
    const skippedCount = results.filter(
      (r) => r.error === "Factory already exists"
    ).length;
    const failureCount = results.filter(
      (r) => r.error && r.error !== "Factory already exists"
    ).length;

    let completionMessage = "Factory creation completed";

    // All succeeded
    if (successCount > 0 && failureCount === 0 && skippedCount === 0) {
      completionMessage = `Successfully created ${successCount} ${successCount === 1 ? "factory" : "factories"}`;
    }
    // All skipped
    else if (skippedCount > 0 && successCount === 0 && failureCount === 0) {
      completionMessage = `All ${skippedCount} ${skippedCount === 1 ? "factory" : "factories"} already exist`;
    }
    // All failed
    else if (failureCount > 0 && successCount === 0 && skippedCount === 0) {
      completionMessage = `Failed to create all ${failureCount} ${failureCount === 1 ? "factory" : "factories"}`;
    }
    // Mixed results with all three types
    else if (successCount > 0 && skippedCount > 0 && failureCount > 0) {
      completionMessage = `Created ${successCount}, skipped ${skippedCount}, failed ${failureCount} factories`;
    }
    // Success and skipped only
    else if (successCount > 0 && skippedCount > 0 && failureCount === 0) {
      completionMessage = `Created ${successCount}, skipped ${skippedCount} factories`;
    }
    // Success and failed only
    else if (successCount > 0 && failureCount > 0 && skippedCount === 0) {
      completionMessage = `Created ${successCount}, failed ${failureCount} factories`;
    }
    // Skipped and failed only
    else if (skippedCount > 0 && failureCount > 0 && successCount === 0) {
      completionMessage = `Skipped ${skippedCount}, failed ${failureCount} factories`;
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
