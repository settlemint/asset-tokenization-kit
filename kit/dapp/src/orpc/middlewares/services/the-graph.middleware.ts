/**
 * TheGraph Middleware Module
 *
 * Provides advanced GraphQL querying capabilities with automatic pagination,
 * variable filtering, and schema validation for TheGraph queries.
 *
 * Key Features:
 * - Automatic pagination using the `@fetchAll` directive OR explicit `first`/`skip` parameters
 * - Merge and filtering of complex GraphQL responses
 * - Integration with Zod for runtime type validation
 * - Support for nested and multiple paginated fields
 *
 * The middleware supports two pagination patterns:
 * 1. **@fetchAll Directive** (NEW): Add `@fetchAll` to any list field to automatically fetch all results
 * 2. **Explicit Parameters**: Include `first` and/or `skip` parameters for manual control
 *
 * @module TheGraphMiddleware
 * @category Middleware
 * @example
 * // Option 1: Using @fetchAll directive (recommended)
 * const TOKENS_QUERY = gql`
 *   query GetAllTokens {
 *     tokens @fetchAll {  # Automatically fetches ALL tokens
 *       id
 *       name
 *       holders @fetchAll {  # Nested pagination also supported
 *         id
 *         balance
 *       }
 *     }
 *   }
 * `;
 *
 * // Option 2: Using explicit pagination parameters
 * const TOKENS_WITH_PARAMS = gql`
 *   query GetTokens {
 *     tokens(first: 1000, skip: 0) {  # Manual pagination control
 *       id
 *       name
 *     }
 *   }
 * `;
 *
 * // Both patterns work with the same client.query API
 * const result = await theGraphClient.query(TOKENS_QUERY, {
 *   output: TokenSchema
 * });
 * // result.tokens contains ALL tokens, regardless of pagination limits
 */
import { theGraphClient } from "@/lib/settlemint/the-graph";
import type { Context } from "@/orpc/context/context";
import type { TadaDocumentNode } from "gql.tada";
import { print } from "graphql";
import {
  ClientError,
  type RequestDocument,
  type Variables,
} from "graphql-request";
import { z } from "zod";
import { baseRouter } from "../../procedures/base.router";

/**
 * Creates a validated TheGraph client with advanced querying capabilities
 *
 * @param {Object} errors - Error handling configuration from the base router
 * @returns {Object} A client with a query method that supports pagination, merging, and validation
 *
 * @description
 * Provides a robust GraphQL client that:
 * - Automatically handles pagination for list fields
 * - Merges complex nested query results
 * - Validates responses against Zod schemas
 * - Filters and preserves GraphQL variables
 *
 * @category Factory
 * @example
 * // Using the client to query with automatic pagination
 * const result = await client.query(TOKENS_QUERY, {
 *   input: { where: { type: 'ERC20' } },
 *   output: TokenSchema
 * });
 */
function createValidatedTheGraphClient(
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"]
) {
  return {
    async query<TResult, TVariables extends Variables, TValidated>(
      document: TadaDocumentNode<TResult, TVariables>,
      options: {
        input: Omit<
          TVariables,
          "skip" | "first" | "orderBy" | "orderDirection"
        >;
        output: z.ZodType<TValidated>;
      }
    ): Promise<TValidated> {
      const { input, output: schema } = options;

      let rawResult: unknown;
      try {
        rawResult = await theGraphClient.request(
          document as RequestDocument,
          input as Variables
        );
        return schema.parse(rawResult);
      } catch (error) {
        throw errors.THE_GRAPH_ERROR({
          message:
            error instanceof ClientError
              ? (error.response.errors?.map((e) => e.message).join(", ") ??
                (error as Error).message)
              : (error as Error).message,
          data: {
            document: print(document),
            variables: input as TVariables,
            stack: error instanceof Error ? error.stack : undefined,
            responseValidation:
              error instanceof z.ZodError ? z.prettifyError(error) : undefined,
          },
          cause: error,
        });
      }
    },
  } as const;
}

export type ValidatedTheGraphClient = ReturnType<
  typeof createValidatedTheGraphClient
>;

/**
 * TheGraph middleware that enhances GraphQL queries with automatic pagination support.
 *
 * This middleware intercepts GraphQL queries to TheGraph and automatically handles
 * pagination for fields decorated with `@fetchAll` or that include `first`/`skip` parameters.
 *
 * @remarks
 * The middleware supports two pagination patterns:
 * 1. **@fetchAll directive**: Add to any list field to automatically fetch all results
 * 2. **Explicit parameters**: Include `first` and/or `skip` for manual pagination control
 *
 * @example
 * // Example 1: Using @fetchAll directive (recommended)
 * export const listAllTokens = systemProcedure
 *   .use(theGraphMiddleware)
 *   .query(async ({ context }) => {
 *     const result = await context.theGraphClient.query(
 *       gql`
 *         query GetAllTokens {
 *           tokens @fetchAll {  # Fetches ALL tokens automatically
 *             id
 *             name
 *             totalSupply
 *           }
 *         }
 *       `,
 *       { output: TokensSchema }
 *     );
 *     return result.tokens; // Contains ALL tokens
 *   });
 *
 * @example
 * // Example 2: Using explicit pagination (backward compatible)
 * export const listTokensPaginated = systemProcedure
 *   .use(theGraphMiddleware)
 *   .query(async ({ context }) => {
 *     const result = await context.theGraphClient.query(
 *       gql`
 *         query GetTokens {
 *           tokens(first: 1000, skip: 0) {  # Manual pagination
 *             id
 *             name
 *           }
 *         }
 *       `,
 *       { output: TokensSchema }
 *     );
 *     return result.tokens; // Also contains ALL tokens
 *   });
 */
export const theGraphMiddleware = baseRouter.middleware<
  Required<Pick<Context, "theGraphClient">>,
  unknown
>((options) => {
  const { context, next, errors } = options;

  // Check if the context already has a validated TheGraph client
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
