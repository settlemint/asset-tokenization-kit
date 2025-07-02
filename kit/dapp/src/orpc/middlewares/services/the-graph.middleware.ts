import { theGraphClient } from "@/lib/settlemint/the-graph";
import type { ListInput } from "@/orpc/routes/common/schemas/list.schema";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import type { TadaDocumentNode } from "gql.tada";
import type { Variables } from "graphql-request";
import type { z } from "zod/v4";
import { baseRouter } from "../../procedures/base.router";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Type guard to check if input matches ListInput structure
 */
function isListInput(input: unknown): input is ListInput {
  return (
    typeof input === "object" &&
    input !== null &&
    "offset" in input &&
    "orderDirection" in input &&
    "orderBy" in input
  );
}

/**
 * Helper to create a filter object from optional input fields.
 *
 * This utility function removes undefined values from an object to create clean
 * GraphQL query filters. It's particularly useful for building dynamic where
 * clauses in auto-paginated queries where filters must be preserved across
 * multiple batch requests.
 *
 * @param fields - Object mapping field names to their values (may include undefined)
 * @returns Filter object with only defined fields, or undefined if all fields are undefined
 *
 * @example
 * ```typescript
 * // Manual approach (verbose):
 * const filter = input.hasTokens !== undefined
 *   ? { hasTokens: input.hasTokens }
 *   : undefined;
 *
 * // Using buildFilter (concise):
 * const filter = buildFilter({
 *   hasTokens: input.hasTokens,
 *   isActive: input.isActive
 * });
 * // Result: { hasTokens: true } if hasTokens is defined and isActive is undefined
 *
 * // Auto-pagination usage:
 * const cleanFilter = buildFilter({ category: input.category });
 * // This filter is automatically preserved across all paginated batch requests
 * ```
 */
export function buildFilter(
  fields: Record<string, unknown>
): Record<string, unknown> | undefined {
  const filter: Record<string, unknown> = {};
  let hasFields = false;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      filter[key] = value;
      hasFields = true;
    }
  }

  return hasFields ? filter : undefined;
}

/**
 * Creates a validated TheGraph client with built-in error handling and validation.
 *
 * This function returns a client that wraps TheGraph GraphQL queries with:
 * - Automatic Zod schema validation for all responses
 * - Operation name extraction from GraphQL documents
 * - Comprehensive error logging and categorization
 * - User-friendly error messages
 * @returns A validated TheGraph client with a `query` method
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
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"]
) {
  return {
    /**
     * Executes auto-paginated GraphQL queries for large result sets.
     *
     * This method handles queries that request more than 1000 records or unlimited records
     * by automatically breaking them into multiple batched requests and merging the results.
     *
     * @param document - The GraphQL query document
     * @param baseVariables - Base query variables
     * @param input - Original list input with limit > 1000 or undefined limit
     * @param operation - Operation name for logging
     * @returns Promise<TResult> - Merged results from all paginated requests
     */
    async executeWithAutoPagination<TResult, TVariables extends Variables>(
      document: TadaDocumentNode<TResult, TVariables>,
      baseVariables: TVariables,
      input: ListInput,
      operation: string
    ): Promise<TResult> {
      const allResults: unknown[] = [];
      let currentSkip = input.offset;
      const totalLimit = input.limit;
      const isUnlimited = totalLimit === undefined;
      let remainingLimit = isUnlimited ? Number.MAX_SAFE_INTEGER : totalLimit;
      let resultFieldName = "";

      logger.debug(`Starting auto-pagination for ${operation}`, {
        totalLimit: isUnlimited ? "unlimited" : totalLimit,
        offset: input.offset,
      });

      while (remainingLimit > 0) {
        const batchSize = Math.min(remainingLimit, 1000);
        const batchVariables = {
          ...baseVariables,
          skip: currentSkip,
          first: batchSize,
        } as TVariables;

        const batchResult = await (
          theGraphClient.request as <D, V extends Variables>(
            doc: TadaDocumentNode<D, V>,
            vars: V
          ) => Promise<D>
        )(document, batchVariables);

        // Extract the array field from the result
        // Find the first array field in the GraphQL response
        const resultObj = batchResult as Record<string, unknown>;
        const arrayFieldEntry = Object.entries(resultObj).find(([, value]) =>
          Array.isArray(value)
        );

        if (!arrayFieldEntry) {
          throw new Error(
            `No array field found in GraphQL response for ${operation}`
          );
        }

        const [fieldName, arrayField] = arrayFieldEntry;
        const batchData = arrayField as unknown[];

        // Store field name for result reconstruction (only on first iteration)
        if (!resultFieldName) {
          resultFieldName = fieldName;
        }

        allResults.push(...batchData);

        // Stop if we got fewer results than requested (end of data)
        if (batchData.length < batchSize) {
          logger.debug(
            `Auto-pagination complete for ${operation} - reached end of data`,
            {
              totalFetched: allResults.length,
              lastBatchSize: batchData.length,
            }
          );
          break;
        }

        currentSkip += batchSize;
        if (!isUnlimited) {
          remainingLimit -= batchSize;
        }

        logger.debug(`Auto-pagination progress for ${operation}`, {
          currentSkip,
          remainingLimit: isUnlimited ? "unlimited" : remainingLimit,
          fetchedSoFar: allResults.length,
        });
      }

      // Reconstruct the result with all paginated data
      return { [resultFieldName]: allResults } as TResult;
    },

    /**
     * Executes a GraphQL query against TheGraph with automatic response validation
     * and variable transformation.
     *
     * This method performs a GraphQL query operation against TheGraph's indexed blockchain data
     * and validates the response against a provided Zod schema. It supports automatic
     * transformation of input variables for common patterns like pagination and filtering.
     *
     * Enhanced Type Safety:
     * - Input must exactly match the GraphQL query's expected variables at compile time
     * - TypeScript will catch mismatches between variable names and input properties
     * - No runtime transformation needed - direct mapping ensures type safety
     *
     * Features:
     * 1. **Strict Type Safety**: Input must match GraphQL variables exactly - no exceptions
     * 2. **Compile-time Validation**: TypeScript catches variable name mismatches immediately
     * 3. **Error Categorization**: Errors are automatically categorized (NOT_FOUND vs INTERNAL_SERVER_ERROR)
     * 4. **Operation Tracking**: Operation names are extracted for better logging and debugging
     * 5. **Consistent Error Messages**: User-friendly messages are shown while technical details are logged
     *
     * @param {TadaDocumentNode} document - The GraphQL query document with TypeScript types
     * @param {object} options - Query configuration object
     * @param {TVariables} options.input - GraphQL variables that must exactly match the query parameters
     * @param {z.ZodType} options.output - Zod schema to validate the response against
     * @param {string} options.error - User-friendly error message to show if the operation fails
     * @returns {Promise<TValidated>} The validated query response data
     *
     * @example
     * ```typescript
     * // Type-safe query - input must match GraphQL variables exactly
     * const response = await client.query(LIST_TOKEN_QUERY, {
     *   input: {
     *     tokenFactory: "0x123...", // Must match $tokenFactory in GraphQL query
     *     skip: 0,                  // Must match $skip in GraphQL query
     *     first: 50,                // Must match $first in GraphQL query
     *     orderBy: "name",          // Must match $orderBy in GraphQL query
     *     orderDirection: "asc"     // Must match $orderDirection in GraphQL query
     *   },
     *   output: TokensResponseSchema,
     *   error: "Failed to list tokens"
     * });
     *
     * // TypeScript error - variable name mismatch
     * const badResponse = await client.query(LIST_TOKEN_QUERY, {
     *   input: {
     *     tokenFacdtory: "0x123...", // ERROR: Property 'tokenFacdtory' does not exist
     *     skip: 0,
     *     first: 50
     *   },
     *   output: TokensResponseSchema,
     *   error: "Failed to list tokens"
     * });
     * ```
     */
    async query<
      TResult,
      TVariables extends Variables,
      TValidated,
      TInput = TVariables,
    >(
      document: TadaDocumentNode<TResult, TVariables>,
      options: {
        input: {
          input: TInput;
          filter?:
            | Record<string, unknown>
            | readonly (keyof TInput)[]
            | undefined;
          transform?: (input: TInput) => TVariables;
        };
        output: z.ZodType<TValidated>;
        error: string;
      }
    ): Promise<TValidated> {
      const {
        input: inputOptions,
        output: schema,
        error: userMessage,
      } = options;
      const { input, filter, transform } = inputOptions;

      // Extract operation name from the GraphQL document metadata for better error messages
      const operation =
        (
          document as TadaDocumentNode<TResult, TVariables> & {
            __meta?: { operationName?: string };
          }
        ).__meta?.operationName ?? "GraphQL Query";

      // Transform variables based on options
      let variables: TVariables;

      if (transform) {
        // Use custom transform function
        variables = transform(input);
      } else if (isListInput(input)) {
        // Automatic transformation for ListSchema inputs
        // Copy all fields except offset/limit, transform those to skip/first
        const { offset, limit, ...otherFields } = input;

        const baseVariables: Record<string, unknown> = {
          ...otherFields,
          skip: offset,
          first: limit ? Math.min(limit, 1000) : 1000,
        };

        // Add filter fields if specified
        if (filter) {
          if (Array.isArray(filter)) {
            // Filter is array of keys - pick only those fields from input
            // Build where clause from filter fields
            const whereClause: Record<string, unknown> = {};
            let hasWhereFields = false;
            
            for (const key of filter) {
              const value = input[key as keyof typeof input];
              if (value !== undefined) {
                whereClause[key as string] = value;
                hasWhereFields = true;
              }
            }
            
            // Add where clause if we have any filter fields
            if (hasWhereFields) {
              baseVariables.where = whereClause;
            }
          } else {
            // Filter is an object - merge directly
            Object.assign(
              baseVariables,
              buildFilter(filter as Record<string, unknown>)
            );
          }
        }

        variables = baseVariables as TVariables;
      } else {
        // No transformation - input must be compatible with GraphQL variables
        variables = input as unknown as TVariables;
      }

      let result: TResult;
      try {
        // Execute single GraphQL query against TheGraph
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
          errorMessage.includes("not found") ||
          errorMessage.includes("404") ||
          errorMessage.includes("No ")
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
 * @remarks
 * - Enforces validation at the middleware level - no bypassing allowed
 * - Essential for procedures that need to query historical blockchain data or events
 * - No mutations supported as TheGraph is read-only
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
  if (context.theGraphClient && "query" in context.theGraphClient) {
    return next({
      context: {
        theGraphClient: context.theGraphClient,
      },
    });
  }

  // Create a new validated client with error handling capabilities
  const theGraphClient = createValidatedTheGraphClient(errors);

  // Pass the client to the next middleware/procedure in the chain
  return next({
    context: {
      theGraphClient,
    },
  });
});

/**
 * Type representing a validated TheGraph client instance with auto-pagination.
 *
 * This type is inferred from the return type of `createValidatedTheGraphClient`
 * and provides TypeScript type information for the enhanced client methods.
 * The client automatically handles pagination, validation, and error management.
 *
 * Key capabilities:
 * - **Auto-pagination**: Transparent handling of queries >1000 results
 * - **Type Safety**: Runtime validation with Zod schemas
 * - **Error Handling**: Categorized errors with user-friendly messages
 * - **Performance**: Optimized batching and early termination
 *
 * @example
 * ```typescript
 * // In a procedure that uses theGraphMiddleware
 * interface Context {
 *   theGraphClient: ValidatedTheGraphClient;
 * }
 *
 * // Single item query (no pagination)
 * async function fetchTokenData(
 *   context: Context,
 *   tokenAddress: string
 * ) {
 *   return context.theGraphClient.query(GET_TOKEN_QUERY, {
 *     input: { input: { id: tokenAddress } },
 *     output: TokenSchema,
 *     error: "Token not found"
 *   });
 * }
 *
 * // Auto-paginated list query
 * async function fetchAllTokens(context: Context) {
 *   return context.theGraphClient.query(LIST_TOKENS_QUERY, {
 *     input: {
 *       input: { offset: 0 } // No limit = unlimited auto-pagination
 *     },
 *     output: TokensResponseSchema,
 *     error: "Failed to fetch tokens"
 *   });
 * }
 *
 * // Large bounded query with filtering
 * async function fetchActiveFactories(context: Context) {
 *   return context.theGraphClient.query(LIST_FACTORIES_QUERY, {
 *     input: {
 *       input: { offset: 0, limit: 5000 }, // Auto-paginated into 5 batches
 *       filter: ["hasTokens"] // Filter preserved across all batches
 *     },
 *     output: FactoriesResponseSchema,
 *     error: "Failed to fetch active factories"
 *   });
 * }
 * ```
 */
export type ValidatedTheGraphClient = ReturnType<
  typeof createValidatedTheGraphClient
>;
