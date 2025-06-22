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
 * 4. Tracks transaction status and returns factory addresses
 *
 * @see {@link ./factory.create.schema} - Input validation schema
 * @see {@link @/orpc/helpers/transactions} - Transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { withEventMeta } from "@orpc/server";
import {
  FactoryCreateMessagesSchema,
  type FactoryCreateOutput,
  getDefaultImplementations,
} from "./factory.create.schema";

/**
 * GraphQL mutation for creating a token factory.
 *
 * @param address - The system contract address to call
 * @param from - The wallet address initiating the transaction
 * @param _factoryImplementation - The factory implementation address
 * @param _tokenImplementation - The token implementation address
 * @param _name - The name for the token factory
 *
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_TOKEN_FACTORY_MUTATION = portalGraphql(`
  mutation CreateTokenFactory(
    $address: String!
    $from: String!
    $factoryImplementation: String!
    $tokenImplementation: String!
    $name: String!
  ) {
    IATKTokenFactoryRegistryRegisterTokenFactory(
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
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client
 *
 * @param input.contract - The system contract address (defaults to standard address)
 * @param input.factories - Single factory or array of factories to create
 * @param input.messages - Optional custom messages for localization
 *
 * @returns Stream of creation progress events
 *
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} PORTAL_ERROR - If Portal GraphQL request fails
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If transaction processing fails
 *
 * @example
 * ```typescript
 * // Create a single bond factory
 * const stream = client.tokens.factoryCreate({
 *   contract: "0x123...",
 *   factories: {
 *     type: "bond",
 *     name: "Corporate Bonds"
 *   }
 * });
 *
 * // Create multiple factories
 * const stream = client.tokens.factoryCreate({
 *   contract: "0x123...",
 *   factories: [
 *     { type: "bond", name: "Corporate Bonds" },
 *     { type: "equity", name: "Common Stock" }
 *   ]
 * });
 * ```
 */
export const factoryCreate = onboardedRouter.tokens.factoryCreate
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, factories } = input;
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

    const results: FactoryCreateOutput["results"] = [];

    /**
     * Checks if an error contains a specific pattern
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

    // Process each factory
    for (const [index, factory] of factoryList.entries()) {
      const progress = { current: index + 1, total: totalFactories };
      const { type, name } = factory;
      const defaults = getDefaultImplementations(type);

      const factoryImplementation =
        factory.factoryImplementation ?? defaults.factoryImplementation;
      const tokenImplementation =
        factory.tokenImplementation ?? defaults.tokenImplementation;

      // Yield starting message
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

      try {
        // Execute the factory creation transaction
        const variables = {
          address: contract,
          from: sender.wallet,
          factoryImplementation: factoryImplementation,
          tokenImplementation: tokenImplementation,
          name: name,
        };

        let validatedHash = "";

        // Use the new mutate method that includes transaction tracking
        for await (const event of context.portalClient.mutate(
          CREATE_TOKEN_FACTORY_MUTATION,
          variables,
          messages.factoryCreationFailed,
          messages
        )) {
          validatedHash = event.transactionHash;

          // Handle different event statuses
          if (event.status === "pending") {
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
    const failureCount = results.filter((r) => r.error).length;

    let completionMessage = messages.factoryCreationCompleted;
    if (successCount > 0 && failureCount === 0) {
      completionMessage = messages.allFactoriesSucceeded.replace(
        "{{count}}",
        String(successCount)
      );
    } else if (successCount > 0 && failureCount > 0) {
      completionMessage = messages.someFactoriesFailed
        .replace("{{success}}", String(successCount))
        .replace("{{failed}}", String(failureCount));
    } else if (failureCount > 0 && successCount === 0) {
      completionMessage = messages.allFactoriesFailed.replace(
        "{{count}}",
        String(failureCount)
      );
    }

    yield withEventMeta(
      {
        status: "completed" as const,
        message: completionMessage,
        results,
        resultSummary: {
          total: totalFactories,
          successful: successCount,
          failed: failureCount,
        },
      },
      { id: "factory-creation-complete", retry: 1000 }
    );
  });
