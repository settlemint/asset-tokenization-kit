import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenSetCapMessagesSchema } from "./token.set-cap.schema";

const TOKEN_SET_CAP_MUTATION = portalGraphql(`
  mutation TokenSetCap(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $newCap: String!
  ) {
    setCap: ISMARTCappedSetCap(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _cap: $newCap
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenSetCap = tokenRouter.token.tokenSetCap
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, newCap } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenSetCapMessagesSchema.parse(input.messages ?? {});

    // Validate that the token supports cap management
    const supportsCap = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.ISMARTCapped
    );

    if (!supportsCap) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support cap management. The token must implement ISMARTCapped interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_SET_CAP_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        newCap: newCap.toString(),
        ...challengeResponse,
      },
      messages.capUpdateFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
