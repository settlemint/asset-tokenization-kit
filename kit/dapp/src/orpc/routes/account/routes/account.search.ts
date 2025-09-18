import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { isAddress } from "viem";
import { z } from "zod";

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
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.accountSearch,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context }) => {
    const { query } = input;

    if (!isAddress(query)) {
      return [];
    }

    const result = await context.theGraphClient.query(SEARCH_ACCOUNT_QUERY, {
      input: { address: query.toLowerCase() },
      output: z.object({
        account: z
          .object({
            id: z.string(),
            isContract: z.boolean(),
            contractName: z.string().nullable().optional(),
          })
          .nullable(),
      }),
    });

    if (!result.account) return [];

    return [
      {
        id: result.account.id,
        isContract: result.account.isContract,
        contractName: result.account.contractName ?? undefined,
      },
    ];
  });
