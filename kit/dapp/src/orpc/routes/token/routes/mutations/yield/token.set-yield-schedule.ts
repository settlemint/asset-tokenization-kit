import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getTransactionReceipt } from "@/orpc/helpers/transaction-receipt";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { withEventMeta } from "@orpc/server";
import { logger } from "better-auth";

const TOKEN_SET_YIELD_SCHEDULE_MUTATION = portalGraphql(`
  mutation TokenSetYieldSchedule(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $schedule: String!
  ) {
    setYieldSchedule: ISMARTYieldSetYieldSchedule(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        schedule: $schedule
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_CREATE_YIELD_SCHEDULE_MUTATION = portalGraphql(`
  mutation TokenCreateYieldSchedule(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $endTime: String!
    $interval: String!
    $rate: String!
    $startTime: String!
    $token: String!
  ) {
    createSchedule: IATKFixedYieldScheduleFactoryCreate(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        endTime: $endTime
        interval: $interval
        rate: $rate
        startTime: $startTime
        token: $token
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenSetYieldSchedule = tokenRouter.token.tokenSetYieldSchedule
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenSetYieldSchedule,
      requiredExtensions: ["YIELD"],
    })
  )
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
    const { auth, t } = context;

    // Generate messages using server-side translations
    const pendingMessage = t(
      "tokens:actions.setYieldSchedule.messages.preparing"
    );
    const successMessage = t(
      "tokens:actions.setYieldSchedule.messages.success"
    );
    const errorMessage = t("tokens:actions.setYieldSchedule.messages.failed");

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    let transactionHash: string | undefined = undefined;

    for await (const event of context.portalClient.mutate(
      TOKEN_CREATE_YIELD_SCHEDULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        endTime: endTime.toString(),
        interval: paymentInterval.toString(),
        rate: yieldRate.toString(),
        startTime: startTime.toString(),
        token: contract,
        ...challengeResponse,
      },
      errorMessage,
      {
        waitingForMining: pendingMessage,
        transactionIndexed: successMessage,
      }
    )) {
      // Store the transaction hash from the first event
      transactionHash = event.transactionHash;

      // Yield all events except confirmed (we'll handle that after getting the system address)
      if (event.status === "pending") {
        yield withEventMeta(
          {
            status: event.status,
            message: event.message,
            result: undefined,
          },
          { id: transactionHash, retry: 1000 }
        );
      } else if (event.status === "failed") {
        // Transform Portal event to ORPC event format with metadata
        yield withEventMeta(
          {
            status: event.status,
            message: event.message,
            result: undefined,
          },
          { id: transactionHash, retry: 1000 }
        );
        return;
      } else {
        // Transaction is confirmed
        break;
      }
    }

    if (!transactionHash) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage,
        cause: new Error("Transaction hash not found"),
      });
    }

    let receipt: Awaited<ReturnType<typeof getTransactionReceipt>>;
    try {
      receipt = await getTransactionReceipt(transactionHash);

      // Check if transaction was successful
      if (receipt.status !== "Success") {
        throw errors.INTERNAL_SERVER_ERROR({
          message: errorMessage,
          cause: new Error(`Transaction failed with status: ${receipt.status}`),
        });
      }
    } catch (err) {
      const error = err as Error;
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage,
        cause: error.message,
      });
    }

    // Look for the last log entry which should contain the schedule created event
    logger.debug("Receipt logs:", receipt.logs);
    logger.debug("Receipt contractAddress:", receipt.contractAddress);
    logger.debug("Receipt status:", receipt.status);
    const logs = Array.isArray(receipt.logs) ? receipt.logs : [];
    let scheduleAddress: string | undefined = undefined;
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      logger.debug("Last log:", lastLog);
      if (lastLog && typeof lastLog === "object" && "address" in lastLog) {
        scheduleAddress = lastLog.address as string;
      }
    }
    if (!scheduleAddress) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage,
        cause: new Error("Schedule address not found"),
      });
    }

    const setScheduleTransactionHash = yield* context.portalClient.mutate(
      TOKEN_SET_YIELD_SCHEDULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        schedule: getEthereumAddress(scheduleAddress),
        ...challengeResponse,
      },
      errorMessage,
      {
        waitingForMining: pendingMessage,
        transactionIndexed: successMessage,
      }
    );

    return getEthereumHash(setScheduleTransactionHash);
  });
