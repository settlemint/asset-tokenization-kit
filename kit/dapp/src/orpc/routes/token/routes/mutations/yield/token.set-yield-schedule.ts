import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenSetYieldScheduleMessagesSchema } from "./token.set-yield-schedule.schema";

const TOKEN_SET_YIELD_SCHEDULE_MUTATION = portalGraphql(`
  mutation TokenSetYieldSchedule(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $yieldRate: String!
    $paymentInterval: String!
    $startTime: String!
    $endTime: String!
  ) {
    setYieldSchedule: ISMARTYieldSetYieldSchedule(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        yieldRate: $yieldRate
        paymentInterval: $paymentInterval
        startTime: $startTime
        endTime: $endTime
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenSetYieldSchedule = tokenRouter.token.tokenSetYieldSchedule
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const {
      contract,
      verification,
      yieldRate,
      paymentInterval,
      startTime,
      endTime,
    } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenSetYieldScheduleMessagesSchema.parse(
      input.messages ?? {}
    );

    // Validate that the token supports yield management
    const supportsYield = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.ISMARTYield
    );

    if (!supportsYield) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support yield management. The token must implement ISMARTYield interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_SET_YIELD_SCHEDULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        yieldRate: yieldRate.toString(),
        paymentInterval: paymentInterval.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        ...challengeResponse,
      },
      messages.yieldScheduleFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
