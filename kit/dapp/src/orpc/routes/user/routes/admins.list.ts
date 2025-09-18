import { kycProfiles, user } from "@/lib/db/schema";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { Context } from "@/orpc/context/context";
import { getAccountsWithRoles } from "@/orpc/helpers/access-control-helpers";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  buildUserWithIdentity,
  buildUserWithoutWallet,
} from "@/orpc/routes/user/utils/user-response.util";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

// GraphQL query to fetch multiple identities by wallet addresses
const READ_IDENTITIES_QUERY = theGraphGraphql(`
  query ReadIdentitiesQuery($walletAddresses: [String!]!, $identityFactory: String!, $registryStorage: String!) {
    identities(where: {
      account_in: $walletAddresses,
      identityFactory: $identityFactory
    }) {
      id
      account {
        id
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
  kyc: {
    firstName: string | null;
    lastName: string | null;
  } | null;
};

/**
 * List of admins
 */
export const adminList = systemRouter.user.adminList
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["identityManager", "claimIssuer"] },
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context }) => {
    const queryResult = await getUsersForAccounts({
      context,
    });

    // Extract wallet addresses for TheGraph query, filtering out null values
    const walletAddresses = queryResult
      .map((row: QueryResultRow) => row.user.wallet)
      .filter((wallet) => wallet !== null)
      .map((wallet) => wallet as string); // Convert to string for GraphQL

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
      });
    });

    // Return paginated response format
    return items;
  });

async function getUsersForAccounts({
  context,
}: {
  context: Required<Pick<Context, "db" | "system">>;
}) {
  const accountsWithSystemRoles =
    context.system?.systemAccessManager?.accessControl;
  if (!accountsWithSystemRoles) {
    return [];
  }
  const accounts = getAccountsWithRoles(accountsWithSystemRoles, true);
  const accountIds = accounts.map((account) => account.id);

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
    .where(inArray(user.wallet, accountIds));

  return accounts
    .map((account) => {
      const user = result.find(
        (user) => user.user.wallet?.toLowerCase() === account.id.toLowerCase()
      );
      if (user) {
        return user;
      }
      return null;
    })
    .filter((user) => user !== null);
}
