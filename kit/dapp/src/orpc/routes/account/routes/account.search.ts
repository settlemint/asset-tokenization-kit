import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { Context } from "@/orpc/context/context";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import {
  AccountSearchGraphResponseSchema,
  type AccountSearchGraphResponse,
} from "@/orpc/routes/account/routes/account.search.schema";
import { identityRead } from "@/orpc/routes/system/identity/routes/identity.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { read as userRead } from "@/orpc/routes/user/routes/user.read";
import { call, ORPCError } from "@orpc/server";
import { isAddress, zeroAddress } from "viem";

const SEARCH_ACCOUNT_QUERY = theGraphGraphql(`
  query SearchAccountQuery($address: ID!) {
    account(id: $address) {
      id
      isContract
      contractName
    }
  }
`);

export const search = authRouter.account.search
  .use(systemMiddleware)
  .use(databaseMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.accountSearch,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context }) => {
    const { theGraphClient } = context;
    const { query } = input;

    if (!isAddress(query) || query === zeroAddress) {
      return [];
    }

    const result = await theGraphClient.query(SEARCH_ACCOUNT_QUERY, {
      input: { address: query.toLowerCase() },
      output: AccountSearchGraphResponseSchema,
    });

    if (!result.account) {
      return [];
    }

    return [
      {
        id: result.account.id,
        isContract: result.account.isContract,
        contractName: result.account.contractName ?? undefined,
        displayName: await getDisplayName(result.account, context),
      },
    ];
  });

async function getDisplayName(
  account: NonNullable<AccountSearchGraphResponse["account"]>,
  context: Context
) {
  const { system } = context;
  const hasUserReadPermission =
    system?.userPermissions?.actions.userRead ?? false;
  const hasIdentityReadPermission =
    system?.userPermissions?.actions.identityRead ?? false;
  const isUserWallet = !account.isContract;
  const isIdentityContract =
    account.isContract && account.contractName === "Identity";

  let fallbackName = account.contractName ?? undefined;
  try {
    if (isUserWallet || isIdentityContract) {
      if (!hasUserReadPermission) {
        return undefined;
      }
      let wallet = account.id;
      if (isIdentityContract) {
        if (!hasIdentityReadPermission) {
          return undefined;
        }
        const identity = await call(
          identityRead,
          {
            identityId: account.id,
          },
          {
            context,
          }
        );
        if (identity) {
          wallet = identity?.account.id;
          fallbackName = `${identity.account.contractName} (ONCHAINID)`;
        }
      }
      const user = await call(
        userRead,
        {
          wallet,
        },
        {
          context,
        }
      );
      return isIdentityContract ? `${user.name} (ONCHAINID)` : user.name;
    }

    return fallbackName;
  } catch (error: unknown) {
    if (error instanceof ORPCError && error.status === 404) {
      return fallbackName;
    }
    throw error;
  }
}
