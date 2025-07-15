import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
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
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, lostWallet } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenRecoverTokensMessagesSchema.parse(
      input.messages ?? {}
    );

    // Validate that the token supports recovery operations
    // All ISMART tokens should support recovery, but let's check for ERC3643 as a proxy
    const supportsRecovery = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.IERC3643
    );

    if (!supportsRecovery) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support recovery operations. The token must implement IERC3643 interface.",
      });
    }

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
