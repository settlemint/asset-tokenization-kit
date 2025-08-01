import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_RECOVER_TOKENS_MUTATION = portalGraphql(`
  mutation TokenRecoverTokens(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $lostWallet: String!
  ) {
    recoverTokens: ISMARTRecoverTokens(
      address: $address
      from: $from
      verificationId: $verificationId
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
  .use(portalMiddleware)
  .handler(async ({ input, context }) => {
    const { contract, verification, lostWallet } = input;
    const { auth } = context;

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    await context.portalClient.mutate(TOKEN_RECOVER_TOKENS_MUTATION, {
      address: contract,
      from: sender.wallet,
      lostWallet,
      ...challengeResponse,
    });

    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
