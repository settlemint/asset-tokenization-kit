import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
// TokensResponseSchema kept for reference; using permissive schema for nested claims extraction
import { TokenListSchema } from "@/orpc/routes/token/routes/token.list.schema";
import { z } from "zod";

/**
 * Schema for TheGraph response with nested identity claims.
 * This provides type safety for the raw GraphQL response.
 */
const GraphQLTokenSchema = z
  .object({
    id: z.string(),
    type: z.string().optional(),
    createdAt: z.string().optional(),
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    totalSupply: z.string().optional(),
    pausable: z
      .object({
        paused: z.boolean(),
      })
      .optional(),
    account: z
      .object({
        identities: z
          .array(
            z.object({
              id: z.string(),
              claims: z
                .array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    revoked: z.boolean(),
                    values: z.array(
                      z.object({
                        key: z.string(),
                        value: z.string(),
                      })
                    ),
                  })
                )
                .optional()
                .default([]),
            })
          )
          .optional()
          .default([]),
      })
      .optional()
      .nullable(),
  })
  .loose(); // Allow additional fields that might come from GraphQL

const GraphQLResponseSchema = z.object({
  tokens: z.array(GraphQLTokenSchema),
});

type GraphQLToken = z.infer<typeof GraphQLTokenSchema>;

/**
 * GraphQL query for retrieving tokenized assets from TheGraph.
 *
 * Tokens represent tokenized real-world assets (RWAs) or digital assets
 * created through token factories. Each token has standard ERC-20 properties
 * like name, symbol, and decimals, but may also include additional compliance
 * and permission features for regulated assets.
 *
 * This query supports:
 * - Automatic pagination using @fetchAll directive
 * - Flexible sorting by any Token field (name, symbol, etc.)
 * - Ordered results in ascending or descending direction
 *
 * @remarks
 * The subgraph indexes all deployed token contracts, regardless of their
 * current state or whether they have any holders.
 */
const LIST_TOKEN_QUERY = theGraphGraphql(`
  query ListTokenQuery($orderBy: Token_orderBy, $orderDirection: OrderDirection, $where: Token_filter, $identityFactory: String!) {
    tokens(
        where: $where
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) @fetchAll {
        id
        type
        createdAt
        name
        symbol
        decimals
        totalSupply
        pausable {
          paused
        }
        account {
          identities(
            where: { identityFactory: $identityFactory }
            first: 1
          ) {
            id
            claims {
              id
              name
              revoked
              values {
                key
                value
              }
            }
          }
        }
      }
    }
  `);

/**
 * Token listing route handler.
 *
 * Retrieves a paginated list of all tokenized assets indexed by the subgraph.
 * This endpoint provides a comprehensive view of all tokens in the system,
 * useful for token explorers, portfolio views, and administrative interfaces.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on tokens
 * Method: GET /token
 *
 * @param input - List parameters including pagination and sorting
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<Token[]> - Array of token objects with basic metadata
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all tokens with default pagination
 * const tokens = await orpc.token.list.query({});
 *
 * // Get tokens sorted by symbol
 * const tokensBySymbol = await orpc.token.list.query({
 *   orderBy: 'symbol',
 *   orderDirection: 'asc'
 * });
 *
 * // Get second page of tokens (50 per page)
 * const page2 = await orpc.token.list.query({
 *   offset: 50,
 *   limit: 50
 * });
 * ```
 *
 * @see {@link TokenListSchema} for the response structure
 * @see {@link ListSchema} for pagination parameters
 */
export const list = systemRouter.token.list.handler(
  async ({ input, context, errors }) => {
    if (!context.system?.identityFactory?.id) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System identity factory not found",
      });
    }

    // Manually construct GraphQL variables for pagination and filtering
    const response = await context.theGraphClient.query(LIST_TOKEN_QUERY, {
      input: {
        where: input.tokenFactory
          ? { tokenFactory_: { id: input.tokenFactory } }
          : undefined,
        identityFactory: context.system.identityFactory.id.toLowerCase(),
      },
      // Use typed schema for the GraphQL response
      output: GraphQLResponseSchema,
    });

    /**
     * Transform tokens to include identity claims for client-side processing.
     *
     * The client has utilities like `parseClaim` to extract specific claim data,
     * so we just return the raw claims and let the client handle the transformation.
     * This approach provides better separation of concerns and allows the client
     * to use existing utilities for claim parsing.
     */
    const tokensWithClaims = response.tokens.map((token: GraphQLToken) => {
      /**
       * Extract the first identity's claims (if available)
       * Each token account can have multiple identities, but we only process the first one.
       */
      const identity = token.account?.identities?.[0];
      const claims = identity?.claims || [];

      /**
       * Return token without the account field but with claims included.
       * This provides a cleaner API surface while making claims available for client processing.
       */
      const { account: _account, ...tokenWithoutAccount } = token;
      return {
        ...tokenWithoutAccount,
        /**
         * Include raw claims for client-side processing.
         * The client can use utilities like `parseClaim` to extract specific data.
         */
        claims,
      };
    });

    return TokenListSchema.parse(tokensWithClaims);
  }
);
