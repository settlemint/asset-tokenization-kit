import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
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
        newCap: $newCap
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenSetCap = tokenRouter.token.tokenSetCap
  .use(
    tokenPermissionMiddleware({
      requiredRoles: ["supplyManagement"],
      requiredExtensions: ["CAPPED"],
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification, newCap } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenSetCapMessagesSchema.parse(input.messages ?? {});

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
