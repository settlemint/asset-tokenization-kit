import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getMutationMessages } from "@/orpc/helpers/mutation-messages";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

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

export const tokenForcedRecover = tokenRouter.token.tokenForcedRecover
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenForcedRecover,
      requiredExtensions: ["CUSTODIAN"],
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification, lostWallet, newWallet } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const { pendingMessage, successMessage, errorMessage } =
      getMutationMessages(t, "tokens", "forcedRecover");

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_FORCED_RECOVER_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        lostWallet,
        newWallet,
        ...challengeResponse,
      },
      errorMessage,
      {
        waitingForMining: pendingMessage,
        transactionIndexed: successMessage,
      }
    );

    return getEthereumHash(transactionHash);
  });
