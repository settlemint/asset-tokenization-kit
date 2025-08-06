import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

const TOKEN_FORCED_RECOVER_MUTATION = portalGraphql(`
  mutation TokenForcedRecover(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $lostWallet: String!
    $newWallet: String!
  ) {
    forcedRecoverTokens: ISMARTCustodianForcedRecoverTokens(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        lostWallet: $lostWallet
        newWallet: $newWallet
      }
    ) {
      transactionHash
    }
  }
`);

export const forcedRecover = tokenRouter.token.forcedRecover
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.forcedRecover,
      requiredExtensions: ["CUSTODIAN"],
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, verification, lostWallet, newWallet } = input;
    const { auth } = context;

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    await context.portalClient.mutate(TOKEN_FORCED_RECOVER_MUTATION, {
      address: contract,
      from: sender.wallet,
      lostWallet,
      newWallet,
      ...challengeResponse,
    });

    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
