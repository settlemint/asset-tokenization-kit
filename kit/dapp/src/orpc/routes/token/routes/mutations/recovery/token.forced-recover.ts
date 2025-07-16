import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenForcedRecoverMessagesSchema } from "./token.forced-recover.schema";

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
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, lostWallet, newWallet } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenForcedRecoverMessagesSchema.parse(
      input.messages ?? {}
    );

    // Validate that the token supports custodian operations
    const supportsCustodian = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.ISMARTCustodian
    );

    if (!supportsCustodian) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support custodian operations. The token must implement ISMARTCustodian interface.",
      });
    }

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
      messages.forcedRecoveryFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
