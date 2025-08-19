import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_RECOVER_TOKENS_MUTATION = portalGraphql(`
  mutation TokenRecoverTokens(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $lostWallet: String!
  ) {
    recoverTokens: ISMARTRecoverTokens(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _lostWallet: $lostWallet
      }
    ) {
      transactionHash
    }
  }
`);

export const recoverTokens = tokenRouter.token.recoverTokens
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.recoverTokens,
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification, lostWallet } = input;
    const { auth } = context;

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_RECOVER_TOKENS_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        lostWallet,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
