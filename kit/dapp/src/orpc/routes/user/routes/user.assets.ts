import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { authRouter } from "@/orpc/procedures/auth.router";
import { UserAssetsGraphQLResponseSchema } from "./user.assets.schema";

const USER_ASSETS_QUERY = theGraphGraphql(`
  query UserAssetsQuery($account: String!) {
    tokenBalances(
      where: { account: $account }
    ) @fetchAll {
      id
      value
      frozen
      available
      token {
        id
        name
        symbol
        decimals
        totalSupply
        bond {
          isMatured
        }
        redeemable {
          redeemedAmount
        }
      }
    }
  }
`);

export const assets = authRouter.user.assets.handler(
  async ({ input, context }) => {
    const walletAddress = input?.wallet ?? context.auth.user.wallet;

    const response = await context.theGraphClient.query(USER_ASSETS_QUERY, {
      input: {
        account: walletAddress.toLowerCase(),
      },
      output: UserAssetsGraphQLResponseSchema,
    });

    return response.tokenBalances;
  }
);
