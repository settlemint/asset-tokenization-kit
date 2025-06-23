import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";

const MINT_TOKEN_MUTATION = portalGraphql(`
  mutation MintToken($address: String!, $to: String!, $amount: String!) {
    mint: IATKBondMint(
      address: $address
      from: $to
      input: { _amount: $amount, _to: $to }
    ) {
      transactionHash
    }
  }
`);

export const mint = authRouter.token.mint
  .use(portalMiddleware)
  .use(tokenMiddleware)
  .use(tokenPermissionMiddleware({ requiredRoles: ["supplyManagement"] }))
  .handler(async ({ input, context }) => {
    const { id, to, amount } = input;

    const result = await context.portalClient.request(MINT_TOKEN_MUTATION, {
      address: id,
      to,
      amount: amount.toString(),
    });

    return getEthereumHash(result.mint?.transactionHash);
  });
