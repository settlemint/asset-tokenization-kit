import { kycProfiles, user } from "@/lib/db/schema";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { getUserRole } from "@atk/zod/user-roles";
import { desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

// GraphQL query to fetch multiple accounts by wallet addresses
const READ_ACCOUNTS_QUERY = theGraphGraphql(`
  query ReadAccountsQuery($walletAddresses: [Bytes!]!) {
    accounts(where: { id_in: $walletAddresses }) {
      id
      country
      identity {
        id
        claims {
          name
        }
      }
    }
  }
`);

// Response schema for accounts query
const AccountsResponseSchema = z.object({
  accounts: z.array(
    z.object({
      id: z.string(),
      country: z.number().nullable().optional(),
      identity: z
        .object({
          id: z.string(),
          claims: z.array(
            z.object({
              name: z.string(),
            })
          ),
        })
        .nullable()
        .optional(),
    })
  ),
});

/**
 * User search route handler.
 *
 * Provides flexible search functionality for users by firstName, lastName, name, or wallet address.
 * This endpoint is optimized for autocomplete, search suggestions, and quick lookups
 * where users need to find specific users without browsing full lists. Includes
 * on-chain identity information such as registration status and claims.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "list" permission on users resource
 * Method: GET /user/search
 *
 * @param input - Search parameters including query string and result limit
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<User[]> - Array of users matching the search criteria
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required list permissions
 * @throws INTERNAL_SERVER_ERROR - If database query fails
 *
 * @example
 * ```typescript
 * // Search for users by name
 * const users = await orpc.user.search.query({
 *   query: "John",
 *   limit: 10
 * });
 *
 * // Search by wallet address
 * const usersByWallet = await orpc.user.search.query({
 *   query: "0x123...abc",
 *   limit: 5
 * });
 *
 * // Search with partial name match
 * const nameMatches = await orpc.user.search.query({
 *   query: "Doe"
 * });
 * ```
 *
 * @remarks
 * - The query parameter is matched against firstName, lastName, name, and wallet address
 * - Uses case-insensitive partial matching (ILIKE) for all fields
 * - Results are limited for performance optimization
 * - User roles are transformed from internal codes to display names
 */
export const search = authRouter.user.search
  .use(
    offChainPermissionsMiddleware({ requiredPermissions: { user: ["list"] } })
  )
  .use(databaseMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
    const { query, limit } = input;

    // Execute search query with KYC data
    const result = await context.db
      .select({
        user: user,
        kyc: {
          firstName: kycProfiles.firstName,
          lastName: kycProfiles.lastName,
        },
      })
      .from(user)
      .leftJoin(kycProfiles, eq(kycProfiles.userId, user.id))
      .where(
        or(
          ilike(kycProfiles.firstName, `%${query}%`),
          ilike(kycProfiles.lastName, `%${query}%`),
          ilike(user.name, `%${query}%`), // Useful when user hasn't completed KYC
          ilike(user.wallet, `%${query}%`)
        )
      )
      .orderBy(desc(user.updatedAt)) // Most recently updated users first
      .limit(limit);

    // Extract wallet addresses for TheGraph query, filtering out null values
    const walletAddresses = result
      .map(({ user }) => user.wallet)
      .filter((wallet): wallet is `0x${string}` => wallet !== null)
      .map((wallet) => wallet as string); // Convert to string for GraphQL

    // Fetch identity data from TheGraph if we have wallet addresses
    let accountsData: z.infer<typeof AccountsResponseSchema> = { accounts: [] };
    if (walletAddresses.length > 0) {
      accountsData = await context.theGraphClient.query(READ_ACCOUNTS_QUERY, {
        input: { walletAddresses },
        output: AccountsResponseSchema,
      });
    }

    // Create a map for quick account lookups
    const accountsMap = new Map(
      accountsData.accounts.map((account) => [
        account.id.toLowerCase(),
        account,
      ])
    );

    // Transform results to include human-readable roles and identity data
    return result.map(({ user, kyc }) => {
      if (!user.wallet) {
        throw new Error(`User ${user.id} has no wallet`);
      }

      // Look up account data for this user
      const account = accountsMap.get(user.wallet.toLowerCase());
      const identity = account?.identity;

      return {
        id: user.id,
        name:
          kyc?.firstName && kyc.lastName
            ? `${kyc.firstName} ${kyc.lastName}`
            : user.name,
        email: user.email,
        role: getUserRole(user.role),
        wallet: user.wallet,
        firstName: kyc?.firstName,
        lastName: kyc?.lastName,
        identity: identity?.id,
        claims: identity?.claims.map((claim) => claim.name) ?? [],
        isRegistered: !!identity,
      } as User;
    });
  });
