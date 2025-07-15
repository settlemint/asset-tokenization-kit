import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenRedeemMessagesSchema } from "./token.redeem.schema";

const TOKEN_REDEEM_MUTATION = portalGraphql(`
  mutation TokenRedeem(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $amount: String!
  ) {
    redeem: ISMARTRedeemableRedeem(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenRedeem = tokenRouter.token.tokenRedeem
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, amount } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenRedeemMessagesSchema.parse(input.messages ?? {});

    // Validate that the token supports redemption
    const supportsRedemption = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.ISMARTRedeemable
    );

    if (!supportsRedemption) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support redemption operations. The token must implement ISMARTRedeemable interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_REDEEM_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        amount: amount.toString(),
        ...challengeResponse,
      },
      messages.redemptionFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
