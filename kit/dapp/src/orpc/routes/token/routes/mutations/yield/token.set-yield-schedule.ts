import { getEthereumAddress } from "@atk/zod/validators/ethereum-address";
import { call } from "@orpc/server";
import { logger } from "better-auth";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getTransactionReceipt } from "@/orpc/helpers/transaction-receipt";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";

const TOKEN_SET_YIELD_SCHEDULE_MUTATION = portalGraphql(`
  mutation TokenSetYieldSchedule(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $schedule: String!
  ) {
    setYieldSchedule: ISMARTYieldSetYieldSchedule(
      address: $address
      from: $from
      challengeId: $challengeId
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
    $challengeId: String
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
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        country: 1
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

export const setYieldSchedule = tokenRouter.token.setYieldSchedule
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.setYieldSchedule,
      requiredExtensions: ["YIELD"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    const {
      contract,
      walletVerification,
      yieldRate,
      paymentInterval,
      startTime,
      endTime,
    } = input;
    const { auth } = context;

    const sender = auth.user;
    const transactionHash = await context.portalClient.mutate(
      TOKEN_CREATE_YIELD_SCHEDULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        endTime: endTime.toString(),
        interval: paymentInterval.toString(),
        rate: yieldRate.toString(),
        startTime: startTime.toString(),
        token: contract,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );
    let receipt: Awaited<ReturnType<typeof getTransactionReceipt>>;
    try {
      receipt = await getTransactionReceipt(transactionHash);
      // Check if transaction was successful
      if (receipt.status !== "Success") {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Transaction failed",
          cause: new Error(`Transaction failed with status: ${receipt.status}`),
        });
      }
    } catch (error_) {
      const error = error_ as Error;
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to get transaction receipt",
        cause: error.message,
      });
    }
    // Look for the last log entry which should contain the schedule created event
    logger.debug("Receipt logs:", receipt.logs);
    logger.debug("Receipt contractAddress:", receipt.contractAddress);
    logger.debug("Receipt status:", receipt.status);
    console.log("Receipt logs:", receipt.logs);
    console.log("Receipt contractAddress:", receipt.contractAddress);
    console.log("Receipt status:", receipt.status);
    const logs = Array.isArray(receipt.logs) ? receipt.logs : [];
    let scheduleAddress: string | undefined;
    if (logs.length > 0) {
      const lastLog = logs.at(-1) as { address?: string } | undefined;
      logger.debug("Last log:", lastLog);
      if (
        lastLog &&
        typeof lastLog === "object" &&
        "address" in lastLog &&
        typeof lastLog.address === "string"
      ) {
        scheduleAddress = lastLog.address;
      }
    }
    if (!scheduleAddress) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create yield schedule",
        cause: new Error("Schedule address not found in transaction logs"),
      });
    }
    console.log("Schedule address:", scheduleAddress);
    // Now set the yield schedule with the created schedule address
    const setYieldScheduleResult = await context.portalClient.mutate(
      TOKEN_SET_YIELD_SCHEDULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        schedule: getEthereumAddress(scheduleAddress),
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );
    logger.debug("Set yield schedule result:", setYieldScheduleResult);
    console.log("Set yield schedule result:", setYieldScheduleResult);
    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
