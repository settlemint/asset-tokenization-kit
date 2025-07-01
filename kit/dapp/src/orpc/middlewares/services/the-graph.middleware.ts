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
 * @param {object} errors - ORPC error constructors for consistent error handling
 * @returns {object} A validated TheGraph client with a `query` method
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
     * Features:
     * 1. **Type Safety**: Response data is validated at runtime against the provided schema
     * 2. **Variable Transformation**: Automatically transforms ListSchema inputs to TheGraph format
     * 3. **Error Categorization**: Errors are automatically categorized (NOT_FOUND vs INTERNAL_SERVER_ERROR)
     * 4. **Operation Tracking**: Operation names are extracted for better logging and debugging
     * 5. **Consistent Error Messages**: User-friendly messages are shown while technical details are logged
     * 6. **Auto-pagination**: Automatically handles queries requesting >1000 records or unlimited records
     *
     * @param {TadaDocumentNode} document - The GraphQL query document with TypeScript types
     * @param {object} options - Query configuration object
     * @param {object} options.input - Input data including the base input and optional transformations
     * @param {TInput} options.input.input - The base input data
     * @param {object|array} options.input.filter - Optional where clause for filtering results (object) or array of keys to pick from input
     * @param {function} options.input.transform - Optional function to transform input before sending
     * @param {z.ZodType} options.output - Zod schema to validate the response against
     * @param {string} options.error - User-friendly error message to show if the operation fails
     * @returns {Promise<TValidated>} The validated query response data
     *
     * @example
     * ```typescript
     * // List query with automatic pagination transformation
     * const response = await client.query(LIST_FACTORIES_QUERY, {
     *   input: {
     *     input,
     *     filter: ['hasTokens'] // or { hasTokens: input.hasTokens }
     *   },
     *   output: FactoriesSchema,
     *   error: "Failed to list factories"
     * });
     *
     * // Large result set (auto-paginated behind the scenes)
     * const allTokens = await client.query(LIST_TOKENS_QUERY, {
     *   input: {
     *     input: { offset: 0, limit: 5000 } // Will auto-paginate
     *   },
     *   output: TokensSchema,
     *   error: "Failed to list all tokens"
     * });
     *
     * // Unlimited result set (gets ALL available records)
     * const everythingTokens = await client.query(LIST_TOKENS_QUERY, {
     *   input: {
     *     input: { offset: 0 } // No limit = get all records
     *   },
     *   output: TokensSchema,
     *   error: "Failed to list all tokens"
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
        const baseVariables: Record<string, unknown> = {
          skip: input.offset,
          first: input.limit ? Math.min(input.limit, 1000) : 1000, // Limit to 1000 per request, or 1000 if unlimited
          orderDirection: input.orderDirection,
        };

        if (input.orderBy) {
          baseVariables.orderBy = input.orderBy;
        }

        // Add filter if provided
        if (filter) {
          const cleanFilter: Record<string, unknown> = {};
          let hasValidFields = false;

          if (Array.isArray(filter)) {
            // If filter is an array of keys, pick those from input
            for (const key of filter) {
              const value = (input as Record<string, unknown>)[key as string];
              if (value !== undefined) {
                cleanFilter[key as string] = value;
                hasValidFields = true;
              }
            }
          } else {
            // If filter is an object, remove undefined values
            for (const [key, value] of Object.entries(filter)) {
              if (value !== undefined) {
                cleanFilter[key] = value;
                hasValidFields = true;
              }
            }
          }

          if (hasValidFields) {
            baseVariables.where = cleanFilter;
          }
        }

        variables = baseVariables as TVariables;
      } else {
        // No transformation needed
        variables = input as unknown as TVariables;
      }

      let result: TResult;
      try {
        // Check if this is a list query that might need auto-pagination
        if (
          isListInput(input) &&
          (input.limit === undefined || input.limit > 1000)
        ) {
          result = await this.executeWithAutoPagination(
            document,
            variables,
            input,
            operation
          );
        } else {
          // Execute single GraphQL query against TheGraph
          // The type assertion is needed because graphql-request has complex conditional types
          result = await (
            theGraphClient.request as <D, V extends Variables>(
              doc: TadaDocumentNode<D, V>,
              vars: V
            ) => Promise<D>
          )(document, variables);
        }
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
