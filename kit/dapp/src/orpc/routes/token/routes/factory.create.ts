/**
 * Token Factory Creation Handler
 *
 * This handler creates token factory contracts through the ATKSystemImplementation
 * using an async generator pattern for real-time transaction tracking and batch progress.
 * It supports creating factories for different asset types (bond, equity, fund,
 * stablecoin, deposit) either individually or in batch with live progress updates.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Processes factory creation requests (single or batch)
 * 3. Executes transactions via Portal GraphQL with real-time tracking
 * 4. Yields progress events for each factory creation
 * 5. Returns a summary of all created factories
 * @generator
 * @see {@link ./factory.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { env } from "@/lib/env";
import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { withEventMeta } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import {
  FactoryCreateMessagesSchema,
  type FactoryCreateOutput,
  getDefaultImplementations,
} from "./factory.create.schema";

const logger = createLogger({
  level: env.SETTLEMINT_LOG_LEVEL,
});

/**
 * GraphQL mutation for creating a token factory.
 * @param address - The system contract address to call
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
 * Creates token factory contracts using async iteration for progress tracking.
 *
 * This handler uses a generator pattern to yield real-time progress updates during
 * factory creation, supporting both single and batch operations with detailed status
 * for each factory being created.
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client with transaction tracking
 * @middleware theGraphMiddleware - Provides TheGraph client
 * @param input.contract - The system contract address (defaults to standard address)
 * @param input.factories - Single factory or array of factories to create
 * @param input.messages - Optional custom messages for localization
 * @yields {FactoryCreationEvent} Progress events with status, message, and current factory info
 * @returns {AsyncGenerator} Generator that yields events and completes with creation summary
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system not bootstrapped or transaction fails
 * @example
 * ```typescript
 * // Create a single bond factory with progress tracking
 * for await (const event of client.tokens.factoryCreate({
 *   contract: "0x123...",
 *   factories: {
 *     type: "bond",
 *     name: "Corporate Bonds"
 *   }
 * })) {
 *   console.log(`${event.status}: ${event.message}`);
 *   if (event.currentFactory) {
 *     console.log(`Creating ${event.currentFactory.type}: ${event.currentFactory.name}`);
 *   }
 * }
 *
 * // Create multiple factories with batch progress
 * for await (const event of client.tokens.factoryCreate({
 *   contract: "0x123...",
 *   factories: [
 *     { type: "bond", name: "Corporate Bonds" },
 *     { type: "equity", name: "Common Stock" }
 *   ]
 * })) {
 *   if (event.progress) {
 *     console.log(`Progress: ${event.progress.current}/${event.progress.total}`);
 *   }
 *   if (event.status === "completed" && event.result) {
 *     const successful = event.result.filter(r => !r.error).length;
 *     console.log(`Created ${successful} factories`);
 *   }
 * }
 * ```
 */
export const factoryCreate = onboardedRouter.token.factoryCreate
  .use(permissionsMiddleware({ system: ["create"] }))
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .use(systemMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, factories, verification } = input;
    const sender = context.auth.user;

    // Parse messages with defaults
    const messages = FactoryCreateMessagesSchema.parse(input.messages ?? {});

    // Normalize to array
    const factoryList = Array.isArray(factories) ? factories : [factories];
    const totalFactories = factoryList.length;

    // Yield initial loading message
    yield withEventMeta(
      {
        status: "pending",
        message: messages.initialLoading,
        progress: { current: 0, total: totalFactories },
      },
      { id: "factory-creation", retry: 1000 }
    );

    // Query existing token factories using the ORPC client
    let existingFactoryNames = new Set<string>();
    try {
      const systemData = context.system;

      if (systemData?.tokenFactories && systemData.tokenFactories.length > 0) {
        existingFactoryNames = new Set(
          systemData.tokenFactories.map((factory) => factory.name.toLowerCase())
        );
      }
    } catch (error) {
      // If we can't fetch existing factories, proceed anyway
      // The contract will reject duplicates
      logger.debug(`Could not fetch existing factories: ${error}`);
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

    // Process each factory using a generator pattern for batch operations
    for (const [index, factory] of factoryList.entries()) {
      const progress = { current: index + 1, total: totalFactories };
      const { type, name } = factory;
      const defaults = getDefaultImplementations(type);

      // Use provided implementations or fall back to defaults for asset type
      const factoryImplementation =
        factory.factoryImplementation ?? defaults.factoryImplementation;
      const tokenImplementation =
        factory.tokenImplementation ?? defaults.tokenImplementation;

      // Yield initial progress message for this factory
      const progressMessage = messages.batchProgress
        .replace("{{current}}", String(progress.current))
        .replace("{{total}}", String(progress.total));

      yield withEventMeta(
        {
          status: "pending" as const,
          message: progressMessage,
          currentFactory: { type, name },
          progress,
        },
        { id: `factory-${factory.type}-${index}`, retry: 1000 }
      );

      // Check if factory already exists
      if (existingFactoryNames.has(name.toLowerCase())) {
        const skipMessage = messages.factoryAlreadyExists.replace(
          "{{name}}",
          name
        );

        yield withEventMeta(
          {
            status: "completed" as const,
            message: skipMessage,
            currentFactory: {
              type,
              name,
              transactionHash: "",
            },
            progress,
          },
          { id: `factory-${factory.type}-${index}`, retry: 1000 }
        );

        results.push({
          type,
          name,
          transactionHash: "",
          error: "Factory already exists",
        });

        continue; // Skip to next factory
      }

      try {
        // Execute the factory creation transaction
        const variables: VariablesOf<typeof CREATE_TOKEN_FACTORY_MUTATION> = {
          address: contract,
          from: sender.wallet ?? "",
          factoryImplementation: factoryImplementation,
          tokenImplementation: tokenImplementation,
          name: name,
          ...(await handleChallenge(sender, {
            code: verification.verificationCode,
            type: verification.verificationType,
          })),
        };

        let validatedHash = "";

        // Use the Portal client's mutate method that returns an async generator
        // This enables real-time transaction tracking for each factory creation
        for await (const event of context.portalClient.mutate(
          CREATE_TOKEN_FACTORY_MUTATION,
          variables,
          messages.factoryCreationFailed,
          messages
        )) {
          // Store transaction hash from the first event
          validatedHash = event.transactionHash;

          // Handle different event statuses and yield appropriate progress updates
          if (event.status === "pending") {
            // Yield pending events to show transaction progress
            yield withEventMeta(
              {
                status: "pending" as const,
                message: event.message,
                currentFactory: {
                  type,
                  name,
                  transactionHash: validatedHash,
                },
                progress,
              },
              { id: `factory-${factory.type}-${index}`, retry: 1000 }
            );
          } else if (event.status === "confirmed") {
            yield withEventMeta(
              {
                status: "confirmed" as const,
                message: messages.factoryCreated,
                currentFactory: {
                  type,
                  name,
                  transactionHash: validatedHash,
                },
                progress,
              },
              { id: `factory-${factory.type}-${index}`, retry: 1000 }
            );

            results.push({
              type,
              name,
              transactionHash: validatedHash,
            });
          } else {
            // event.status === "failed"
            yield withEventMeta(
              {
                status: "failed" as const,
                message: event.message,
                currentFactory: {
                  type,
                  name,
                  transactionHash: validatedHash,
                  error: event.message,
                },
                progress,
              },
              { id: `factory-${factory.type}-${index}`, retry: 1000 }
            );

            results.push({
              type,
              name,
              transactionHash: validatedHash,
              error: event.message,
            });
          }
        }
      } catch (error) {
        // Check for specific error types
        let errorMessage = messages.defaultError;
        let errorDetail = messages.defaultError;

        if (error instanceof Error) {
          errorDetail = error.message;
          // Check for SystemNotBootstrapped error
          if (containsErrorPattern(error, "SystemNotBootstrapped")) {
            errorMessage = messages.systemNotBootstrapped;
            // For critical errors like system not bootstrapped, throw proper error
            throw errors.INTERNAL_SERVER_ERROR({
              message: errorMessage,
              cause: new Error(errorDetail),
            });
          }
        }

        const errorResult = {
          status: "failed" as const,
          message: errorMessage,
          currentFactory: {
            type,
            name,
            error: errorDetail,
          },
          progress,
        };

        yield withEventMeta(errorResult, {
          id: `factory-${factory.type}-${index}`,
          retry: 1000,
        });

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

    let completionMessage = messages.factoryCreationCompleted;

    // All succeeded
    if (successCount > 0 && failureCount === 0 && skippedCount === 0) {
      completionMessage = messages.allFactoriesSucceeded.replace(
        "{{count}}",
        String(successCount)
      );
    }
    // All skipped
    else if (skippedCount > 0 && successCount === 0 && failureCount === 0) {
      completionMessage = messages.allFactoriesSkipped.replace(
        "{{count}}",
        String(skippedCount)
      );
    }
    // All failed
    else if (failureCount > 0 && successCount === 0 && skippedCount === 0) {
      completionMessage = messages.allFactoriesFailed.replace(
        "{{count}}",
        String(failureCount)
      );
    }
    // Mixed results with all three types
    else if (successCount > 0 && skippedCount > 0 && failureCount > 0) {
      completionMessage = messages.someFactoriesSkipped
        .replace("{{success}}", String(successCount))
        .replace("{{skipped}}", String(skippedCount))
        .replace("{{failed}}", String(failureCount));
    }
    // Success and skipped only
    else if (successCount > 0 && skippedCount > 0 && failureCount === 0) {
      completionMessage = messages.someFactoriesSkipped
        .replace("{{success}}", String(successCount))
        .replace("{{skipped}}", String(skippedCount))
        .replace("{{failed}}", "0");
    }
    // Success and failed only
    else if (successCount > 0 && failureCount > 0 && skippedCount === 0) {
      completionMessage = messages.someFactoriesFailed
        .replace("{{success}}", String(successCount))
        .replace("{{failed}}", String(failureCount));
    }
    // Skipped and failed only
    else if (skippedCount > 0 && failureCount > 0 && successCount === 0) {
      completionMessage = messages.someFactoriesSkipped
        .replace("{{success}}", "0")
        .replace("{{skipped}}", String(skippedCount))
        .replace("{{failed}}", String(failureCount));
    }

    yield withEventMeta(
      {
        status: "completed" as const,
        message: completionMessage,
        results,
        result: results, // Added for useStreamingMutation hook compatibility
        progress: {
          current: totalFactories,
          total: totalFactories,
        },
      },
      { id: "factory-creation-complete", retry: 1000 }
    );
  });
