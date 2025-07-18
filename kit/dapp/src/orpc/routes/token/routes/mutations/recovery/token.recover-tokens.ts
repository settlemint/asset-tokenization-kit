import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { TokenRecoverTokensMessagesSchema } from "./token.recover-tokens.schema";

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

export const tokenRecoverTokens = tokenRouter.token.tokenRecoverTokens
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenRecoverTokens,
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification, lostWallet } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenRecoverTokensMessagesSchema.parse(
      input.messages ?? {}
    );

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_RECOVER_TOKENS_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        lostWallet,
        ...challengeResponse,
      },
      messages.recoveryFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
