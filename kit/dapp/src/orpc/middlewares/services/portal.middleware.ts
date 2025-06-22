import { portalClient } from "@/lib/settlemint/portal";
import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ethereumHash } from "@/lib/zod/validators/ethereum-hash";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { withEventMeta } from "@orpc/server";
import type { TadaDocumentNode } from "gql.tada";
import type { Variables } from "graphql-request";
import { z } from "zod/v4";
import { baseRouter } from "../../procedures/base.router";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

interface TransactionEvent {
  status: "pending" | "confirmed" | "failed";
  message: string;
  transactionHash: string;
}

/**
 * Creates a validated Portal client with built-in error handling and validation
 */
function createValidatedPortalClient(
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"],
  theGraphClient?: ValidatedTheGraphClient
) {
  const client = {
    async *mutate<TResult, TVariables extends Variables>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: TVariables,
      userMessage: string,
      trackingMessages?: {
        streamTimeout?: string;
        waitingForMining?: string;
        transactionFailed?: string;
        transactionDropped?: string;
        waitingForIndexing?: string;
        transactionIndexed?: string;
        indexingTimeout?: string;
      }
    ): AsyncGenerator<TransactionEvent, string, void> {
      // Extract operation name from document metadata
      const operation =
        (
          document as TadaDocumentNode<TResult, TVariables> & {
            __meta?: { operationName?: string };
          }
        ).__meta?.operationName ?? "GraphQL Mutation";

      let result: TResult;
      try {
        // The graphql-request library has complex conditional types that TypeScript can't resolve
        // at compile time, but we know we're always passing variables
        result = await (
          portalClient.request as <D, V extends Variables>(
            doc: TadaDocumentNode<D, V>,
            vars: V
          ) => Promise<D>
        )(document, variables);
      } catch (error) {
        logger.error(`GraphQL ${operation} failed`, {
          operation,
          ...variables,
          error: error instanceof Error ? error.message : String(error),
        });

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Use specialized errors when possible
        if (
          errorMessage.includes("Portal") ||
          errorMessage.includes("portal")
        ) {
          throw errors.PORTAL_ERROR({
            message: userMessage,
            data: { operation, details: errorMessage },
          });
        }

        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(`GraphQL ${operation} failed: ${errorMessage}`),
        });
      }

      // Find transaction hash in the result
      const found = findTransactionHash(result);
      if (!found) {
        logger.error(`No transaction hash found in ${operation} response`, {
          operation,
          result,
        });

        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(
            `No transaction hash found in ${operation} response`
          ),
        });
      }

      // Validate the transaction hash
      let transactionHash: string;
      try {
        transactionHash = ethereumHash.parse(found.value);
      } catch (zodError) {
        logger.error(`Invalid transaction hash format`, {
          operation,
          value: found.value,
          path: found.path,
          error: zodError,
        });

        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(`Invalid transaction hash format from ${operation}`),
        });
      }

      // If no theGraphClient is provided, just return the transaction hash
      if (!theGraphClient) {
        yield withEventMeta(
          {
            status: "pending",
            message: "Transaction submitted",
            transactionHash,
          },
          { id: transactionHash, retry: 1000 }
        );
        return transactionHash;
      }

      // Inline transaction tracking logic
      const MAX_ATTEMPTS = 30;
      const DELAY_MS = 2000;
      const POLLING_INTERVAL_MS = 500;
      const INDEXING_TIMEOUT_MS = 60_000;
      const STREAM_TIMEOUT_MS = 90_000;

      const GET_TRANSACTION_QUERY = portalGraphql(`
        query GetTransaction($transactionHash: String!) {
          getTransaction(transactionHash: $transactionHash) {
            receipt {
              status
              revertReasonDecoded
              revertReason
              blockNumber
            }
          }
        }
      `);

      const GET_INDEXING_STATUS_QUERY = theGraphGraphql(`
        query GetIndexingStatus {
          _meta {
            block {
              number
            }
          }
        }
      `);

      const messages = {
        streamTimeout:
          trackingMessages?.streamTimeout ??
          "Transaction tracking timed out. Please check the status later.",
        waitingForMining:
          trackingMessages?.waitingForMining ??
          "Waiting for transaction to be mined...",
        transactionFailed:
          trackingMessages?.transactionFailed ??
          "Transaction failed. Please try again.",
        transactionDropped:
          trackingMessages?.transactionDropped ??
          "Transaction was dropped from the network. Please try again.",
        waitingForIndexing:
          trackingMessages?.waitingForIndexing ??
          "Transaction confirmed. Waiting for indexing...",
        transactionIndexed:
          trackingMessages?.transactionIndexed ??
          "Transaction successfully indexed.",
        indexingTimeout:
          trackingMessages?.indexingTimeout ??
          "Indexing is taking longer than expected. Data will be available soon.",
      };

      const streamStartTime = Date.now();

      // Phase 1: Monitor transaction confirmation on blockchain
      let receipt:
        | { status: "Success" | "Reverted"; blockNumber: string }
        | undefined;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
          yield withEventMeta(
            {
              status: "failed" as const,
              message: messages.streamTimeout,
              transactionHash,
            },
            { id: transactionHash, retry: 1000 }
          );
          throw errors.INTERNAL_SERVER_ERROR({
            message: userMessage,
            cause: new Error(messages.streamTimeout),
          });
        }

        const result = await client.query(
          GET_TRANSACTION_QUERY,
          { transactionHash },
          z.object({
            getTransaction: z
              .object({
                receipt: z
                  .object({
                    status: z.enum(["Success", "Reverted"]),
                    revertReasonDecoded: z.string().nullable(),
                    revertReason: z.string().nullable(),
                    blockNumber: z.string(),
                  })
                  .optional(),
              })
              .nullable(),
          }),
          messages.waitingForMining
        );

        receipt = result.getTransaction?.receipt;

        if (!receipt) {
          yield withEventMeta(
            {
              status: "pending",
              message: messages.waitingForMining,
              transactionHash,
            },
            { id: transactionHash, retry: 1000 }
          );
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          continue;
        }

        if (receipt.status !== "Success") {
          yield withEventMeta(
            {
              status: "failed",
              message: messages.transactionFailed,
              transactionHash,
            },
            { id: transactionHash, retry: 1000 }
          );
          throw errors.INTERNAL_SERVER_ERROR({
            message: userMessage,
            cause: new Error(messages.transactionFailed),
          });
        }

        break;
      }

      if (!receipt) {
        yield withEventMeta(
          {
            status: "failed",
            message: messages.transactionDropped,
            transactionHash,
          },
          { id: transactionHash, retry: 1000 }
        );
        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(messages.transactionDropped),
        });
      }

      // Phase 2: Monitor indexing on TheGraph
      yield withEventMeta(
        {
          status: "pending",
          message: messages.waitingForIndexing,
          transactionHash,
        },
        { id: transactionHash, retry: 1000 }
      );

      const targetBlockNumber = Number(receipt.blockNumber);

      for (
        let attempt = 0;
        attempt < Math.ceil(INDEXING_TIMEOUT_MS / POLLING_INTERVAL_MS);
        attempt++
      ) {
        if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
          yield withEventMeta(
            {
              status: "failed",
              message: messages.streamTimeout,
              transactionHash,
            },
            { id: transactionHash, retry: 1000 }
          );
          throw errors.INTERNAL_SERVER_ERROR({
            message: userMessage,
            cause: new Error(messages.streamTimeout),
          });
        }

        const result = await theGraphClient.query(
          GET_INDEXING_STATUS_QUERY,
          {},
          z.object({
            _meta: z
              .object({
                block: z.object({
                  number: z.number(),
                }),
              })
              .nullable(),
          }),
          messages.waitingForIndexing
        );

        const indexedBlock = result._meta?.block.number ?? 0;

        if (indexedBlock >= targetBlockNumber) {
          // Always yield the final confirmed event
          yield withEventMeta(
            {
              status: "confirmed",
              message: messages.transactionIndexed,
              transactionHash,
            },
            { id: transactionHash, retry: 1000 }
          );
          return transactionHash;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, POLLING_INTERVAL_MS)
        );
      }

      // Indexing timeout
      yield withEventMeta(
        {
          status: "confirmed",
          message: messages.indexingTimeout,
          transactionHash,
        },
        { id: transactionHash, retry: 1000 }
      );

      return transactionHash;
    },

    async query<TResult, TVariables extends Variables, TValidated>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: TVariables,
      schema: z.ZodType<TValidated>,
      userMessage: string
    ): Promise<TValidated> {
      const operation =
        (
          document as TadaDocumentNode<TResult, TVariables> & {
            __meta?: { operationName?: string };
          }
        ).__meta?.operationName ?? "GraphQL Query";

      let result: TResult;
      try {
        result = await (
          portalClient.request as <D, V extends Variables>(
            doc: TadaDocumentNode<D, V>,
            vars: V
          ) => Promise<D>
        )(document, variables);
      } catch (error) {
        logger.error(`GraphQL ${operation} failed`, {
          operation,
          ...variables,
          error: error instanceof Error ? error.message : String(error),
        });

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (
          errorMessage.includes("Portal") ||
          errorMessage.includes("portal")
        ) {
          throw errors.PORTAL_ERROR({
            message: userMessage,
            data: { operation, details: errorMessage },
          });
        }

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("404")
        ) {
          throw errors.NOT_FOUND({
            message: userMessage,
            data: { operation, details: errorMessage },
          });
        }

        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(`GraphQL ${operation} failed: ${errorMessage}`),
        });
      }

      // Validate with Zod schema
      const parseResult = schema.safeParse(result);
      if (!parseResult.success) {
        logger.error(`Invalid response format from ${operation}`, {
          operation,
          result,
          error: parseResult.error,
        });

        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(
            `Invalid response format from ${operation}: ${parseResult.error.message}`
          ),
        });
      }

      return parseResult.data;
    },
  } as const;

  return client;
}

/**
 * Recursively searches for a transactionHash field in a GraphQL response
 */
function findTransactionHash(
  obj: unknown,
  path = ""
): { value: unknown; path: string } | null {
  if (!obj || typeof obj !== "object") {
    return null;
  }

  if ("transactionHash" in obj && obj.transactionHash !== undefined) {
    return {
      value: obj.transactionHash,
      path: path ? `${path}.transactionHash` : "transactionHash",
    };
  }

  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object") {
      const newPath = path ? `${path}.${key}` : key;
      const found = findTransactionHash(value, newPath);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * ORPC middleware that injects a validated Portal client into the procedure context.
 *
 * This middleware provides a Portal client with built-in validation for all GraphQL operations:
 * - Mutations automatically extract and validate transaction hashes
 * - Queries require and enforce Zod schema validation
 * - All operations include consistent error handling and logging
 *
 * @example
 * ```typescript
 * // For mutations - automatic transaction hash extraction
 * const txHash = await context.portalClient.mutate(
 *   CREATE_SYSTEM_MUTATION,
 *   { address: contract, from: sender },
 *   messages.systemCreationFailed
 * );
 *
 * // For queries - required schema validation
 * const DeploymentSchema = z.object({
 *   deployment: z.object({
 *     id: z.string(),
 *     status: z.enum(["active", "inactive"])
 *   })
 * });
 *
 * const result = await context.portalClient.query(
 *   GET_DEPLOYMENT_QUERY,
 *   { id: deploymentId },
 *   DeploymentSchema,
 *   messages.deploymentNotFound
 * );
 * ```
 */
export const portalMiddleware = baseRouter.middleware((options) => {
  const { context, next, errors } = options;

  // If already has our methods, use existing client
  if (context.portalClient && "mutate" in context.portalClient) {
    return next({
      context: {
        portalClient: context.portalClient,
      },
    });
  }

  // Create validated client with theGraphClient if available
  const portalClient = createValidatedPortalClient(
    errors,
    context.theGraphClient
  );

  // Return with guaranteed portalClient
  return next({
    context: {
      portalClient,
    },
  });
});

// Export the inferred type of the validated client
export type ValidatedPortalClient = ReturnType<
  typeof createValidatedPortalClient
>;
