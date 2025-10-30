import { kycProfiles, user } from "@/lib/db/schema";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import {
  buildUserWithIdentity,
  buildUserWithoutWallet,
} from "@/orpc/routes/user/utils/user-response.util";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import {
  type AnyColumn,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

// GraphQL query to fetch multiple identities by wallet addresses
const READ_IDENTITIES_QUERY = theGraphGraphql(`
  query ReadIdentitiesQuery($walletAddresses: [String!]!, $identityFactory: String!, $registryStorage: String!, $systemId: String!) {
    identities(where: {
      account_in: $walletAddresses,
      identityFactory: $identityFactory
    }) {
      id
      account {
        id
        systemStats(where: { system: $systemId }) {
          isAdmin
        }
      }
      claims {
        id
        name
        revoked
        issuer { id }
        values { key value }
      }
      registered(where: { registryStorage: $registryStorage }) {
        id
        country
      }
    }
  }
`);

// Response schema for identities query
const IdentitiesResponseSchema = z.object({
  identities: z.array(
    z.object({
      id: z.string(),
      account: z.object({
        id: z.string(),
        systemStats: z
          .array(
            z.object({
              isAdmin: z.boolean(),
            })
          )
          .nullable(),
      }),
      claims: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          revoked: z.boolean(),
          issuer: z.object({ id: ethereumAddress }),
          values: z.array(z.object({ key: z.string(), value: z.string() })),
        })
      ),
      registered: z
        .array(
          z.object({
            id: z.string(),
            country: z.number(),
          })
        )
        .nullable()
        .optional(),
    })
  ),
});

// Type for database query result rows
type QueryResultRow = {
  user: typeof user.$inferSelect;
  name: string;
  kyc: {
    firstName: string | null;
    lastName: string | null;
  } | null;
};

/**
 * User listing route handler.
 *
 * Retrieves a paginated list of users from the database with support for
 * flexible sorting and pagination. This endpoint provides complete user data
 * including blockchain identity information for administrative interfaces.
 *
 * **Key Differences from user.search:**
 * - ✅ **Complete user data** including blockchain identity (identity, claims, isRegistered)
 * - ✅ Full pagination support (offset/limit with large datasets)
 * - ✅ Flexible sorting by any user table column
 * - ✅ No search query required (can list all users)
 * - ❌ Slower response (includes TheGraph blockchain data)
 * - ❌ Not optimized for UI components (larger payload)
 *
 * **Use Cases:**
 * - Administrative user management dashboards
 * - Complete user directory browsing
 * - Identity verification workflows
 * - User data export/reporting
 *
 * **When to use user.search instead:**
 * - User selection dropdowns/autocomplete
 * - Quick user lookup for forms
 * - UI components that don't need identity data
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "list" permission on users resource
 * Method: GET /users
 *
 * @param input - List parameters including pagination and sorting
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<User[]> - Array of complete user objects including identity data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required list permissions
 * @throws INTERNAL_SERVER_ERROR - If database query fails
 *
 * @example
 * ```typescript
 * // ✅ Good: Get all users for admin dashboard
 * const users = await orpc.user.list.query({});
 * // Returns: Full user data including identity, claims, isRegistered
 *
 * // ✅ Good: Get users for identity verification
 * const usersByEmail = await orpc.user.list.query({
 *   orderBy: 'email',
 *   orderDirection: 'desc'
 * });
 *
 * // ✅ Good: Paginated user browsing
 * const page2 = await orpc.user.list.query({
 *   offset: 20,
 *   limit: 20
 * });
 *
 * // ❌ Bad: Don't use for dropdown/select components
 * // Use user.search instead for better performance
 * ```
 *
 * @remarks
 * - **Complete Data**: Includes blockchain identity fields (identity, claims, isRegistered)
 * - **Flexible Sorting**: Supports any valid user table column
 * - **Large Datasets**: Handles pagination for thousands of users
 * - **Performance**: Slower than user.search due to TheGraph integration
 */
export const list = systemRouter.user.list
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.userList,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input }) => {
    const {
      limit: inputLimit,
      offset,
      orderDirection,
      orderBy,
      filters,
    } = input;

    const limit = inputLimit ?? 1000;

    // Configure sort direction based on input
    const order = orderDirection === "desc" ? desc : asc;

    // Safely access the order column, defaulting to createdAt if invalid
    const nameSelect = sql<string>`
      COALESCE(
        COALESCE(${kycProfiles.firstName}, '') || ' ' || COALESCE(${kycProfiles.lastName}, ''),
        ${user.name}
      )
    `;
    // Sorting is done case insensitive
    const nameSort = sql<string>`
      LOWER(
        COALESCE(${kycProfiles.firstName}, '') ||
        COALESCE(${kycProfiles.lastName}, '') ||
        COALESCE(${user.name}, '')
      )
    `;
    // Note: Sorting by 'wallet' uses nameSort, which sorts by a concatenation of firstName, lastName, and user.name.
    // This does NOT sort by wallet address, but by user name.
    const orderColumn =
      orderBy === "wallet"
        ? nameSort
        : ((user[orderBy as keyof typeof user] as AnyColumn | undefined) ??
          user.createdAt);

    // Get total count first
    const totalResult = await context.db.select({ count: count() }).from(user);

    const total = totalResult[0]?.count ?? 0;

    // Execute paginated query with sorting and KYC data

    const queryResult = await context.db
      .select({
        user: user,
        name: nameSelect.as("name"),
        kyc: {
          firstName: kycProfiles.firstName,
          lastName: kycProfiles.lastName,
        },
      })
      .from(user)
      .leftJoin(kycProfiles, eq(kycProfiles.userId, user.id))
      .orderBy(order(orderColumn))
      .where(
        or(
          ilike(nameSelect, `%${filters?.search ?? ""}%`),
          ilike(user.email, `%${filters?.search ?? ""}%`),
          ilike(user.wallet, `%${filters?.search ?? ""}%`)
        )
      )
      .limit(limit)
      .offset(offset);

    // Extract wallet addresses for TheGraph query, filtering out null values
    const walletAddresses = queryResult
      .map((row: QueryResultRow) => row.user.wallet)
      .filter(
        (wallet: `0x${string}` | null): wallet is `0x${string}` =>
          wallet !== null
      )
      .map((wallet: `0x${string}`) => wallet as string); // Convert to string for GraphQL

    // Fetch identity data from TheGraph if we have wallet addresses
    // NOTE: This fetches ALL claims for ALL users, which is intentional and not a security issue.
    // Claims are stored on-chain for public verifiability - anyone can query TheGraph directly
    // to see all claims anyway. The identityPermissionsMiddleware provides UI/UX access control,
    // filtering what gets displayed in the application interface based on user roles, not true
    // data security. This approach allows:
    // - Identity managers to see all claims for full system oversight
    // - KYC/AML issuers to see only relevant claims for their workflows
    // - Clean, role-appropriate user interfaces without information overload
    let identitiesData: z.infer<typeof IdentitiesResponseSchema> = {
      identities: [],
    };
    if (walletAddresses.length > 0) {
      identitiesData = await context.theGraphClient.query(
        READ_IDENTITIES_QUERY,
        {
          input: {
            walletAddresses,
            identityFactory: context.system.identityFactory.id.toLowerCase(),
            registryStorage:
              context.system.identityRegistryStorage.id.toLowerCase(),
            systemId: context.system.id.toLowerCase(),
          },
          output: IdentitiesResponseSchema,
        }
      );
    }

    // Create a map for quick identity lookups by account address
    const identitiesMap = new Map(
      identitiesData.identities.map((identity) => [
        identity.account.id.toLowerCase(),
        identity,
      ])
    );

    // Transform results to include human-readable roles, onboarding state, and identity data
    const items = queryResult.map((row: QueryResultRow) => {
      const { user: u, kyc } = row;

      // Handle users without wallets gracefully
      if (!u.wallet) {
        return buildUserWithoutWallet({
          userData: u,
          kyc,
          context,
        });
      }

      // Look up identity data for this user
      const identity = identitiesMap.get(u.wallet.toLowerCase());
      const registeredEntry = identity?.registered?.[0];

      return buildUserWithIdentity({
        userData: u,
        kyc,
        identity: identity?.id,
        claims: identity?.claims ?? [],
        isRegistered: !!registeredEntry,
        context,
        isAdmin: identity?.account.systemStats?.[0]?.isAdmin ?? false,
      });
    });

    // Return paginated response format
    return {
      items,
      total,
      limit,
      offset,
    };
  });
