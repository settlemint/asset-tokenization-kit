import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
// TokensResponseSchema kept for reference; using permissive schema for nested claims extraction
import { TokenListSchema } from "@/orpc/routes/token/routes/token.list.schema";
import { z } from "zod";

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
      // Use a permissive schema so we can access nested account.identities.claims
      // for price/classification extraction before final transformation.
      output: z.object({ tokens: z.array(z.any()) }),
    });

    /**
     * Transform tokens to extract price and asset classification data from identity claims.
     *
     * Why we process claims here instead of in the GraphQL query:
     * 1. Claims are stored as flexible key-value pairs, making them unsuitable for direct GraphQL selection
     * 2. Business logic for price extraction varies by asset type and requires conditional processing
     * 3. TheGraph doesn't support complex claim filtering, so we filter revoked claims client-side
     * 4. Type safety: We need to parse and validate claim values before exposing them to the UI
     *
     * This approach provides better separation of concerns and allows for complex business rules
     * around price display while maintaining backwards compatibility with existing token data.
     */
    const tokensWithPriceData = response.tokens.map((token) => {
      /**
       * Type assertion is necessary because TheGraph returns additional nested data
       * that isn't captured in our base Token schema. We need access to the full
       * identity/claims structure to extract price information.
       */
      const tokenRaw = token as unknown as {
        account?: {
          identities?: Array<{
            claims?: Array<{
              id: string;
              name: string;
              revoked: boolean;
              values: Array<{ key: string; value: string }>;
            }>;
          }>;
        };
      } & Record<string, unknown>;

      /**
       * Each token account can have multiple identities, but we only process the first one
       * that matches our identity factory. This design choice ensures:
       * 1. Consistent data structure across all tokens
       * 2. Performance optimization by limiting claim processing
       * 3. Business rule enforcement (one primary identity per token)
       */
      const identity = tokenRaw.account?.identities?.[0];
      const claims = identity?.claims || [];

      /**
       * Extract price and asset classification data from identity claims.
       *
       * Why we use specific claim names:
       * - "basePrice": Represents the fundamental/intrinsic value of the underlying asset
       * - "assetClassification": Determines whether price display is relevant for this token type
       *
       * Business Logic Trade-offs:
       * 1. We only show prices for classified assets (bonds, equities, etc.) to avoid confusion
       * 2. Price data is optional because not all tokens have pricing (utility tokens, governance tokens)
       * 3. We filter revoked claims to ensure data accuracy and handle claim lifecycle management
       * 4. Currency code is preserved separately to support multi-currency pricing in the future
       */
      let price:
        | { amount?: string; currencyCode?: string; decimals?: number }
        | undefined;
      let assetClassification:
        | { class?: string; category?: string }
        | undefined;

      /**
       * Process each claim to extract structured data.
       * We iterate through all claims to handle cases where multiple pricing
       * claims might exist (e.g., base price vs. market price).
       */
      for (const claim of claims) {
        /**
         * Skip revoked claims to maintain data integrity.
         * Revoked claims represent outdated or incorrect information that
         * should not be displayed to users but are preserved for audit trails.
         */
        if (!claim.revoked) {
          /**
           * Transform claim values from array format to object for easier access.
           * This conversion allows us to access claim data using property names
           * instead of iterating through key-value pairs repeatedly.
           */
          const claimValues: Record<string, string> = {};
          for (const kv of claim.values) {
            claimValues[kv.key] = kv.value;
          }

          /**
           * Extract base price information for financial assets.
           * Base price represents the fundamental value, distinct from market price
           * or current trading price. This is typically used for bonds (face value),
           * real estate (appraised value), or other RWA with intrinsic worth.
           */
          if (claim.name === "basePrice") {
            price = {
              amount: claimValues.amount,
              currencyCode: claimValues.currencyCode,
              /**
               * Parse decimals as number for consistent numeric operations.
               * Decimals determine display precision (e.g., 2 for USD cents).
               * We handle undefined gracefully for backwards compatibility.
               */
              decimals: claimValues.decimals
                ? Number(claimValues.decimals)
                : undefined,
            };
          } else if (claim.name === "assetClassification") {
            /**
             * Extract asset classification to determine UI display behavior.
             * Only tokens with asset classification will show price columns,
             * preventing confusion between financial assets and utility tokens.
             */
            assetClassification = {
              class: claimValues.class, // e.g., "debt", "equity", "commodity"
              category: claimValues.category, // e.g., "bond", "stock", "reit"
            };
          }
        }
      }

      /**
       * Transform the token object for API response.
       *
       * Why we remove the account field:
       * 1. Security: Account data contains sensitive identity information not needed by the UI
       * 2. Performance: Reduces payload size by removing nested GraphQL data
       * 3. API Design: Clean separation between internal processing and public API surface
       * 4. Type Safety: Ensures response matches our schema without exposing internal structures
       *
       * The price and assetClassification fields are added at the root level for:
       * - Easy access by UI components
       * - Consistent API structure across all tokens
       * - Clear indication of data availability (undefined = no data)
       */
      const { account: _account, ...tokenWithoutAccount } = tokenRaw;
      return {
        ...tokenWithoutAccount,
        /**
         * Price data extracted from basePrice claim.
         * Undefined when no valid price claim exists or token isn't a financial asset.
         */
        price,
        /**
         * Asset classification extracted from claims.
         * Used to determine whether price columns should be displayed in the UI.
         * Undefined for utility tokens, governance tokens, and other non-financial assets.
         */
        assetClassification,
      };
    });

    return TokenListSchema.parse(tokensWithPriceData);
  }
);
