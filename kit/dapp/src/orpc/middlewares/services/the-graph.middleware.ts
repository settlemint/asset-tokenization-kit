import { createLogger, type LogLevel } from '@settlemint/sdk-utils/logging';
import type { TadaDocumentNode } from 'gql.tada';
import type { Variables } from 'graphql-request';
import type { z } from 'zod/v4';
import { theGraphClient } from '@/lib/settlemint/the-graph';
import { baseRouter } from '../../procedures/base.router';

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Creates a validated TheGraph client with built-in error handling and validation.
 *
 * This function returns a client that wraps TheGraph GraphQL queries with:
 * - Automatic Zod schema validation for all responses
 * - Operation name extraction from GraphQL documents
 * - Comprehensive error logging and categorization
 * - User-friendly error messages
 *
 * @param {Object} errors - ORPC error constructors for consistent error handling
 *
 * @returns {Object} A validated TheGraph client with a `query` method
 *
 * @example
 * ```typescript
 * const client = createValidatedTheGraphClient(errors);
 *
 * // Query with validation
 * const data = await client.query(
 *   GET_TRANSFERS_QUERY,
 *   { tokenAddress: "0x123..." },
 *   TransfersSchema,
 *   "Failed to fetch transfer history"
 * );
 * ```
 */
function createValidatedTheGraphClient(
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]['errors']
) {
  return {
    /**
     * Executes a GraphQL query against TheGraph with automatic response validation.
     *
     * This method performs a GraphQL query operation against TheGraph's indexed blockchain data
     * and validates the response against a provided Zod schema. Unlike raw GraphQL queries,
     * this method ensures:
     *
     * 1. **Type Safety**: Response data is validated at runtime against the provided schema
     * 2. **Error Categorization**: Errors are automatically categorized (NOT_FOUND vs INTERNAL_SERVER_ERROR)
     * 3. **Operation Tracking**: Operation names are extracted for better logging and debugging
     * 4. **Consistent Error Messages**: User-friendly messages are shown while technical details are logged
     *
     * @param {TadaDocumentNode} document - The GraphQL query document with TypeScript types
     * @param {TVariables} variables - Variables for the GraphQL query
     * @param {z.ZodType} schema - Zod schema to validate the response against. This schema
     *   must match the expected response structure from TheGraph
     * @param {string} userMessage - User-friendly error message to show if the operation fails.
     *   This message is shown to end users, while technical details are logged separately
     *
     * @returns {Promise<TValidated>} The validated query response data matching the provided schema
     *
     * @throws {NOT_FOUND} When TheGraph returns a 404 error or "not found" message,
     *   typically indicating the subgraph doesn't exist or the entity wasn't found
     * @throws {INTERNAL_SERVER_ERROR} When the query fails for other reasons or when
     *   the response doesn't match the expected schema structure
     *
     * @example
     * ```typescript
     * // Define the expected response schema
     * const TokenTransfersSchema = z.object({
     *   transfers: z.array(z.object({
     *     id: z.string(),
     *     from: z.string(),
     *     to: z.string(),
     *     value: z.string(),
     *     timestamp: z.string(),
     *     transactionHash: z.string()
     *   }))
     * });
     *
     * // Execute query with validation
     * const transfers = await client.query(
     *   GET_TOKEN_TRANSFERS_QUERY,
     *   {
     *     tokenAddress: "0x123...",
     *     first: 100,
     *     orderBy: "timestamp",
     *     orderDirection: "desc"
     *   },
     *   TokenTransfersSchema,
     *   "Failed to fetch token transfer history"
     * );
     *
     * // TypeScript knows transfers matches TokenTransfersSchema
     * transfers.transfers.forEach(transfer => {
     *   console.log(`${transfer.from} → ${transfer.to}: ${transfer.value}`);
     * });
     *
     * // Complex aggregation query example
     * const StatsSchema = z.object({
     *   token: z.object({
     *     id: z.string(),
     *     totalSupply: z.string(),
     *     holdersCount: z.number()
     *   }),
     *   dailySnapshots: z.array(z.object({
     *     date: z.string(),
     *     volume: z.string(),
     *     priceUSD: z.string()
     *   }))
     * });
     *
     * const stats = await client.query(
     *   GET_TOKEN_ANALYTICS_QUERY,
     *   { tokenId: tokenAddress, days: 30 },
     *   StatsSchema,
     *   "Failed to load token analytics"
     * );
     * ```
     */
    async query<TResult, TVariables extends Variables, TValidated>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: TVariables,
      schema: z.ZodType<TValidated>,
      userMessage: string
    ): Promise<TValidated> {
      // Extract operation name from the GraphQL document metadata for better error messages
      const operation =
        (
          document as TadaDocumentNode<TResult, TVariables> & {
            __meta?: { operationName?: string };
          }
        ).__meta?.operationName ?? 'GraphQL Query';

      let result: TResult;
      try {
        // Execute the GraphQL query against TheGraph
        // The type assertion is needed because graphql-request has complex conditional types
        result = await (
          theGraphClient.request as <D, V extends Variables>(
            doc: TadaDocumentNode<D, V>,
            vars: V
          ) => Promise<D>
        )(document, variables);
      } catch (error) {
        // Log the error with full context for debugging
        logger.error(`GraphQL ${operation} failed`, {
          operation,
          ...variables,
          error: error instanceof Error ? error.message : String(error),
        });

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Check for specific error patterns to provide appropriate error types
        // TheGraph returns 404 when a subgraph doesn't exist or hasn't been deployed
        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('404') ||
          errorMessage.includes('No ')
        ) {
          throw errors.NOT_FOUND({
            message: userMessage,
            data: { operation, details: errorMessage },
          });
        }

        // All other errors are treated as internal server errors
        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(`GraphQL ${operation} failed: ${errorMessage}`),
        });
      }

      // Validate the response against the provided Zod schema
      // This ensures the data structure matches what the application expects
      const parseResult = schema.safeParse(result);
      if (!parseResult.success) {
        // Log validation error details for debugging
        logger.error(`Invalid response format from ${operation}`, {
          operation,
          result,
          error: parseResult.error,
        });

        // Throw user-friendly error while preserving technical details in the cause
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
}

/**
 * ORPC middleware that injects a validated TheGraph client into the procedure context.
 *
 * This middleware provides a TheGraph client with built-in validation for all GraphQL queries:
 * - All queries require and enforce Zod schema validation
 * - Operation names are automatically extracted from GraphQL documents
 * - Consistent error handling and logging
 *
 * @remarks
 * - Enforces validation at the middleware level - no bypassing allowed
 * - Essential for procedures that need to query historical blockchain data or events
 * - No mutations supported as TheGraph is read-only
 *
 * @example
 * ```typescript
 * const TransfersSchema = z.object({
 *   transfers: z.array(z.object({
 *     id: z.string(),
 *     from: z.string(),
 *     to: z.string(),
 *     value: z.string()
 *   }))
 * });
 *
 * const result = await context.theGraphClient.query(
 *   GET_TRANSFERS_QUERY,
 *   { tokenId: input.tokenId },
 *   TransfersSchema,
 *   messages.transfersNotFound
 * );
 * ```
 */
export const theGraphMiddleware = baseRouter.middleware((options) => {
  const { context, next, errors } = options;

  // Check if the context already has a validated TheGraph client
  // This prevents creating duplicate clients when middlewares are chained
  if (context.theGraphClient && 'query' in context.theGraphClient) {
    return next({
      context: {
        theGraphClient: context.theGraphClient,
      },
    });
  }

  // Create a new validated client with error handling capabilities
  const validatedTheGraphClient = createValidatedTheGraphClient(errors);

  // Pass the client to the next middleware/procedure in the chain
  return next({
    context: {
      theGraphClient: validatedTheGraphClient,
    },
  });
});

/**
 * Type representing a validated TheGraph client instance.
 *
 * This type is inferred from the return type of `createValidatedTheGraphClient`
 * and provides TypeScript type information for the client's methods.
 *
 * @example
 * ```typescript
 * // In a procedure that uses theGraphMiddleware
 * interface Context {
 *   theGraphClient: ValidatedTheGraphClient;
 * }
 *
 * async function fetchTokenData(
 *   context: Context,
 *   tokenAddress: string
 * ) {
 *   return context.theGraphClient.query(
 *     GET_TOKEN_QUERY,
 *     { id: tokenAddress },
 *     TokenSchema,
 *     "Token not found"
 *   );
 * }
 * ```
 */
export type ValidatedTheGraphClient = ReturnType<
  typeof createValidatedTheGraphClient
>;
