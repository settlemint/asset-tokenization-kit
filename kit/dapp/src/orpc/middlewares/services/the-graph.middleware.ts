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
    "limit" in input &&
    "orderDirection" in input
  );
}

/**
 * Helper to create a filter object from optional input fields.
 * Only includes fields that are not undefined.
 *
 * @param fields - Object mapping field names to their values
 * @returns Filter object with only defined fields, or undefined if all fields are undefined
 *
 * @example
 * ```typescript
 * // Instead of:
 * filter: (input) => input.hasTokens !== undefined
 *   ? { hasTokens: input.hasTokens }
 *   : undefined
 *
 * // Use:
 * filter: (input) => buildFilter({ hasTokens: input.hasTokens })
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
     *
     * @param {TadaDocumentNode} document - The GraphQL query document with TypeScript types
     * @param {object} options - Query configuration object
     * @param {object} options.input - Input data including the base input and optional transformations
     * @param {TInput} options.input.input - The base input data
     * @param {object} options.input.filter - Optional where clause for filtering results
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
     *     filter: buildFilter({ hasTokens: input.hasTokens })
     *   },
     *   output: FactoriesSchema,
     *   error: "Failed to list factories"
     * });
     *
     * // Read query with ID transformation
     * const factory = await client.query(READ_FACTORY_QUERY, {
     *   input: {
     *     input: { id },
     *     transform: (input) => ({ id: input.id.toLowerCase() })
     *   },
     *   output: FactorySchema,
     *   error: "Failed to read factory"
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
          filter?: Record<string, unknown> | undefined;
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
          first: input.limit,
          orderDirection: input.orderDirection,
        };

        if (input.orderBy) {
          baseVariables.orderBy = input.orderBy;
        }

        // Add filter if provided, removing undefined values
        if (filter) {
          const cleanFilter: Record<string, unknown> = {};
          let hasValidFields = false;

          for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined) {
              cleanFilter[key] = value;
              hasValidFields = true;
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
 * Type representing a validated TheGraph client instance.
 *
 * This type is inferred from the return type of `createValidatedTheGraphClient`
 * and provides TypeScript type information for the client's methods.
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
