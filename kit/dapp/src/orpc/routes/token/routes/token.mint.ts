import { portalGraphql } from "@/lib/settlemint/portal";
import {
  ethereumHash,
  getEthereumHash,
} from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import z from "zod/v4";

const MINT_BOND_MUTATION = portalGraphql(`
  mutation MintToken(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $to: String!
    $amount: String!
  ) {
    mint: IATKBondMint(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: { _amount: $amount, _to: $to }
    ) {
      transactionHash
    }
  }
`);

export const mint = tokenRouter.token.mint
  .use(tokenPermissionMiddleware({ requiredRoles: ["supplyManagement"] }))
  .use(portalMiddleware)
  .handler(async ({ input, context }) => {
    const { id, to, amount, verificationCode, verificationType } = input;
    const { auth } = context;

    const sender = auth.user;
    const result = await context.portalClient.query(
      MINT_BOND_MUTATION,
      {
        address: id,
        from: sender.wallet ?? "",
        to,
        amount: amount.toString(),
        ...(await handleChallenge(sender, {
          code: verificationCode,
          type: verificationType,
        })),
      },
      z.object({
        mint: z.object({
          transactionHash: ethereumHash,
        }),
      }),
      "Failed to mint token"
    );

    return getEthereumHash(result.mint.transactionHash);
  });
