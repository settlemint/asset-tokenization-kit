import { kycProfiles, user } from "@/lib/db/schema";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { Context } from "@/orpc/context/context";
import { getAccountsWithRoles } from "@/orpc/helpers/access-control-helpers";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import {
  buildUserWithIdentity,
  buildUserWithoutWallet,
} from "@/orpc/routes/user/utils/user-response.util";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { eq, inArray } from "drizzle-orm";
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
          id
          name
          revoked
          issuer { id }
          values { key value }
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
              id: z.string(),
              name: z.string(),
              revoked: z.boolean(),
              issuer: z.object({ id: ethereumAddress }),
              values: z.array(z.object({ key: z.string(), value: z.string() })),
            })
          ),
        })
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
export const adminList = authRouter.user.adminList
  .use(systemMiddleware)
  .use(theGraphMiddleware)
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

      // Look up account data for this user
      const account = accountsMap.get(u.wallet.toLowerCase());
      const identity = account?.identity;

      return buildUserWithIdentity({
        userData: u,
        kyc,
        identity: identity?.id,
        claims: identity?.claims ?? [],
        isRegistered: !!identity,
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

  return accounts.map((account) => {
    const user = result.find(
      (user) => user.user.wallet?.toLowerCase() === account.id.toLowerCase()
    );
    if (user) {
      return user;
    }
    return {
      user: {
        id: account.id,
        wallet: account.id,
        name: account.id,
      },
      kyc: null,
    } as QueryResultRow;
  });
}
