import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
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
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { account: ["list"] },
    })
  )
  .use(theGraphMiddleware)
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
