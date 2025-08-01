import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ethereumHash } from "@/lib/zod/validators/ethereum-hash";
import {
  getTransactionHash,
  type TransactionHash,
} from "@/lib/zod/validators/transaction-hash";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import { createLogger } from "@settlemint/sdk-utils/logging";
import type { TadaDocumentNode } from "gql.tada";
import type { Variables } from "graphql-request";
import { z } from "zod";
import { baseRouter } from "../../procedures/base.router";

const logger = createLogger();

/**
 * Creates a validated Portal client with built-in error handling and validation.
 *
 * This function returns a client that wraps Portal GraphQL operations with:
 * - Automatic transaction hash extraction and validation for mutations
 * - Real-time transaction tracking with event streaming
 * - Zod schema validation for queries
 * - Consistent error handling and logging
 * - Integration with TheGraph for indexing status monitoring
 * @param {object} errors - ORPC error constructors for consistent error handling
 * @param {ValidatedTheGraphClient} [theGraphClient] - Optional TheGraph client for indexing monitoring.
 *   If provided, mutations will track both blockchain confirmation and indexing status.
 *   If omitted, mutations will only track blockchain confirmation.
 * @returns {object} A validated Portal client with `mutate` and `query` methods
 * @example
 * ```typescript
 * const client = createValidatedPortalClient(errors, theGraphClient);
 *
 * // For mutations with transaction tracking
 * for await (const event of client.mutate(CREATE_TOKEN_MUTATION, variables, "Failed to create token")) {
 *   console.log(event.status, event.message);
 * }
 *
 * // For queries with validation
 * const data = await client.query(GET_TOKEN_QUERY, variables, TokenSchema, "Token not found");
 * ```
 */
function createValidatedPortalClient(
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"],
  theGraphClient?: ValidatedTheGraphClient
) {
  const client = {
    /**
     * Executes a GraphQL mutation and waits for the transaction to complete.
     *
     * This method submits a mutation to Portal and monitors the resulting transaction
     * through its lifecycle until it's confirmed on-chain and indexed by TheGraph.
     *
     * @param {TadaDocumentNode} document - The GraphQL mutation document
     * @param {TVariables} variables - Variables for the GraphQL mutation
     * @param {string} userMessage - User-friendly error message to show if operation fails
     * @param {object} [trackingMessages] - Optional custom messages for each tracking phase
     * @returns {Promise<string>} The transaction hash once confirmed
     * @throws {PORTAL_ERROR} When Portal GraphQL operation fails
     * @throws {PORTAL_ERROR} When transaction fails, times out, or has invalid format
     * @example
     * ```typescript
     * // Basic usage
     * const txHash = await client.mutate(
     *   CREATE_TOKEN_MUTATION,
     *   { name: "MyToken" },
     *   "Failed to create token"
     * );
     *
     * // With custom messages
     * const txHash = await client.mutate(
     *   TRANSFER_MUTATION,
     *   { to: recipient, amount },
     *   "Transfer failed",
     *   {
     *     waitingForMining: "Processing your transfer...",
     *     transactionIndexed: "Transfer completed successfully!"
     *   }
     * );
     * ```
     */
    async mutate<TResult, TVariables extends Variables>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: TVariables
    ): Promise<TransactionHash> {
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
        throw errors.PORTAL_ERROR({
          message: `GraphQL ${operation} failed`,
          data: {
            document,
            variables,
          },
          cause: error,
        });
      }

      // Find transaction hash in the result
      const found = findTransactionHash(result);
      if (!found) {
        logger.error(`No transaction hash found in ${operation} response`, {
          operation,
          result,
        });

        throw errors.PORTAL_ERROR({
          message: `No transaction hash found in ${operation} response`,
          data: {
            document,
            variables,
          },
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

        throw errors.PORTAL_ERROR({
          message: `Invalid transaction hash format: ${zodError instanceof Error ? zodError.message : String(zodError)}`,
          data: {
            document,
            variables,
            responseValidation: `Invalid transaction hash at ${found.path}: ${found.value}`,
          },
          cause: zodError,
        });
      }

      // If no theGraphClient is provided, just return the transaction hash
      if (!theGraphClient) {
        logger.info(`Transaction submitted: ${transactionHash}`);
        return getTransactionHash(transactionHash);
      }

      // ===== TRANSACTION TRACKING CONFIGURATION =====
      // These constants control the timing and retry behavior of transaction monitoring
      const MAX_ATTEMPTS = 30; // Maximum attempts to check transaction status
      const DELAY_MS = 2000; // Delay between transaction status checks (2 seconds)
      const POLLING_INTERVAL_MS = 500; // Interval for indexing status checks (500ms)
      const INDEXING_TIMEOUT_MS = 60_000; // Maximum time to wait for indexing (1 minute)
      const STREAM_TIMEOUT_MS = 90_000; // Total timeout for the entire tracking process (1.5 minutes)

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

      const streamStartTime = Date.now();

      // ===== PHASE 1: BLOCKCHAIN CONFIRMATION =====
      // Monitor the transaction until it's mined and included in a block.
      // This phase polls the blockchain to check if the transaction has been:
      // - Mined successfully (status: "Success")
      // - Reverted (status: "Reverted")
      // - Dropped from the mempool (no receipt after timeout)
      let receipt:
        | {
            status: "Success" | "Reverted";
            blockNumber: string;
            revertReasonDecoded: string | null;
            revertReason: string | null;
          }
        | undefined;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
          logger.error(`Transaction tracking timeout for ${transactionHash}`);
          throw errors.PORTAL_ERROR({
            message: `Transaction tracking timeout after ${STREAM_TIMEOUT_MS}ms`,
            data: {
              document: GET_TRANSACTION_QUERY,
              variables: { transactionHash },
              responseValidation: `Transaction ${transactionHash} timed out after ${Date.now() - streamStartTime}ms`,
            },
          });
        }

        const transactionQueryVariables = { transactionHash };
        const result = await client.query(
          GET_TRANSACTION_QUERY,
          transactionQueryVariables,
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
                  .nullable(),
              })
              .nullable(),
          })
        );

        receipt = result.getTransaction?.receipt ?? undefined;

        if (!receipt) {
          logger.debug(
            `Waiting for transaction ${transactionHash} to be mined...`
          );
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          continue;
        }

        if (receipt.status !== "Success") {
          logger.error(`Transaction ${transactionHash} failed`);
          throw errors.PORTAL_ERROR({
            message: `Transaction reverted: ${receipt.revertReasonDecoded || receipt.revertReason || "Unknown reason"}`,
            data: {
              document: GET_TRANSACTION_QUERY,
              variables: transactionQueryVariables,
              responseValidation: `Transaction ${transactionHash} reverted with status ${receipt.status}`,
            },
          });
        }

        break;
      }

      if (!receipt) {
        logger.error(`Transaction ${transactionHash} dropped`);
        throw errors.PORTAL_ERROR({
          message: "Transaction dropped from mempool",
          data: {
            document: GET_TRANSACTION_QUERY,
            variables: { transactionHash },
            responseValidation: `Transaction ${transactionHash} dropped after ${MAX_ATTEMPTS} attempts`,
          },
        });
      }

      // ===== PHASE 2: THEGRAPH INDEXING =====
      // After blockchain confirmation, wait for TheGraph to index the transaction.
      // This ensures that the transaction data is available for queries.
      // TheGraph needs to process the block containing our transaction before
      // the dApp can display updated data.
      logger.debug(
        `Waiting for TheGraph to index transaction ${transactionHash}`
      );

      const targetBlockNumber = Number(receipt.blockNumber);
      const indexingQueryVariables = {};

      for (
        let attempt = 0;
        attempt < Math.ceil(INDEXING_TIMEOUT_MS / POLLING_INTERVAL_MS);
        attempt++
      ) {
        if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
          logger.error(`TheGraph indexing timeout for ${transactionHash}`);
          throw errors.PORTAL_ERROR({
            message: `TheGraph indexing timeout after ${STREAM_TIMEOUT_MS}ms`,
            data: {
              document: GET_INDEXING_STATUS_QUERY,
              variables: indexingQueryVariables,
              responseValidation: `Indexing timeout for transaction ${transactionHash} at block ${targetBlockNumber}`,
            },
          });
        }

        const result = await theGraphClient.query(GET_INDEXING_STATUS_QUERY, {
          input: indexingQueryVariables,
          output: z.object({
            _meta: z
              .object({
                block: z.object({
                  number: z.number(),
                }),
              })
              .nullable(),
          }),
        });

        const indexedBlock = result._meta?.block.number ?? 0;

        if (indexedBlock >= targetBlockNumber) {
          logger.info(`Transaction ${transactionHash} successfully indexed`);
          return getTransactionHash(transactionHash);
        }

        await new Promise((resolve) =>
          setTimeout(resolve, POLLING_INTERVAL_MS)
        );
      }

      // Indexing timeout - but transaction was confirmed, so we still return success
      logger.error(
        `TheGraph indexing timeout for ${transactionHash}, but transaction was confirmed`
      );
      return getTransactionHash(transactionHash);
    },

    /**
     * Executes a GraphQL query with automatic response validation.
     *
     * This method performs a GraphQL query operation and validates the response
     * against a provided Zod schema. This ensures type safety at runtime and
     * helps catch API response format changes early.
     * @param {TadaDocumentNode} document - The GraphQL query document
     * @param {TVariables} variables - Variables for the GraphQL query
     * @param {z.ZodType} schema - Zod schema to validate the response against
     * @param {string} userMessage - User-friendly error message to show if operation fails
     * @returns {Promise<TValidated>} The validated query response data
     * @throws {PORTAL_ERROR} When the Portal service encounters an error
     * @throws {NOT_FOUND} When the requested resource is not found
     * @throws {PORTAL_ERROR} When the query fails or response validation fails
     * @example
     * ```typescript
     * // Define the expected response schema
     * const TokenSchema = z.object({
     *   getToken: z.object({
     *     id: z.string(),
     *     name: z.string(),
     *     symbol: z.string(),
     *     totalSupply: z.string(),
     *     decimals: z.number()
     *   })
     * });
     *
     * // Execute query with validation
     * const tokenData = await client.query(
     *   GET_TOKEN_QUERY,
     *   { tokenId: "0x123..." },
     *   TokenSchema,
     *   "Failed to fetch token details"
     * );
     *
     * // TypeScript knows tokenData matches TokenSchema
     * console.log(tokenData.getToken.name); // Type-safe access
     *
     * // Complex nested schema example
     * const TransferHistorySchema = z.object({
     *   getTransfers: z.array(z.object({
     *     id: z.string(),
     *     from: z.string(),
     *     to: z.string(),
     *     amount: z.string(),
     *     timestamp: z.number(),
     *     transaction: z.object({
     *       hash: z.string(),
     *       blockNumber: z.number()
     *     })
     *   }))
     * });
     *
     * const transfers = await client.query(
     *   GET_TRANSFER_HISTORY_QUERY,
     *   { address: userAddress, limit: 10 },
     *   TransferHistorySchema,
     *   "Failed to load transfer history"
     * );
     * ```
     */
    async query<TResult, TVariables extends Variables, TValidated>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: TVariables,
      schema: z.ZodType<TValidated>
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
        throw errors.PORTAL_ERROR({
          message: `GraphQL ${operation} failed`,
          data: {
            document,
            variables,
          },
          cause: error,
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

        // Check if this is a null response (common for queries that return no data)
        if (result === null || result === undefined) {
          throw errors.NOT_FOUND();
        }

        throw errors.PORTAL_ERROR({
          message: `Invalid response format from ${operation}`,
          data: {
            document,
            variables,
            responseValidation: z.prettifyError(parseResult.error),
          },
          cause: parseResult.error,
        });
      }

      return parseResult.data;
    },
  } as const;

  return client;
}

/**
 * Recursively searches for a transactionHash field in a GraphQL response.
 *
 * This helper function performs a depth-first search through an object structure
 * to locate a `transactionHash` field. This is necessary because different GraphQL
 * mutations may return the transaction hash at different nesting levels in the response.
 * @param {unknown} obj - The object to search through (typically a GraphQL response)
 * @param {string} [path] - The current path in the object tree (used for recursion and error reporting)
 * @returns {{ value: unknown; path: string } | null} An object containing the found value and its path,
 *   or null if no transactionHash field is found
 * @example
 * ```typescript
 * // Example mutation response structures this function handles:
 *
 * // Direct response
 * const response1 = { transactionHash: "0x123..." };
 * findTransactionHash(response1); // { value: "0x123...", path: "transactionHash" }
 *
 * // Nested in mutation result
 * const response2 = {
 *   createToken: {
 *     transactionHash: "0x456...",
 *     token: { id: "1" }
 *   }
 * };
 * findTransactionHash(response2); // { value: "0x456...", path: "createToken.transactionHash" }
 *
 * // Deeply nested
 * const response3 = {
 *   data: {
 *     result: {
 *       transaction: {
 *         transactionHash: "0x789..."
 *       }
 *     }
 *   }
 * };
 * findTransactionHash(response3); // { value: "0x789...", path: "data.result.transaction.transactionHash" }
 *
 * // Not found
 * const response4 = { success: true, id: "123" };
 * findTransactionHash(response4); // null
 * ```
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
