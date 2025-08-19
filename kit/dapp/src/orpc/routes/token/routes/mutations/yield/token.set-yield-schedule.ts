import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { AddonFactoryTypeIdEnum } from "@atk/zod/src/validators/addon-types";
import { getEthereumAddress } from "@atk/zod/validators/ethereum-address";
import { call } from "@orpc/server";
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
    $country: Int!
  ) {
    createSchedule: IATKFixedYieldScheduleFactoryCreate(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        country: $country
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

const GET_YIELD_SCHEDULE_ADDRESS_QUERY = theGraphGraphql(`
query GetYieldScheduleAddress($transactionHash: Bytes!) {
  tokenFixedYieldSchedules(where: {deployedInTransaction: $transactionHash}) {
    id
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
      countryCode,
    } = input;
    const { auth, system } = context;
    const systemAddons = system?.systemAddons;
    const yieldScheduleAddon = systemAddons?.find(
      (addon) =>
        addon.typeId === AddonFactoryTypeIdEnum.ATKFixedYieldScheduleFactory
    );

    if (!yieldScheduleAddon) {
      throw errors.NOT_FOUND({
        message: "Yield schedule addon not found in system",
      });
    }

    const sender = auth.user;
    const transactionHash = await context.portalClient.mutate(
      TOKEN_CREATE_YIELD_SCHEDULE_MUTATION,
      {
        address: yieldScheduleAddon.id,
        from: sender.wallet,
        endTime: endTime.toString(),
        interval: paymentInterval.toString(),
        rate: yieldRate.toString(),
        startTime: startTime.toString(),
        token: contract,
        country: countryCode,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    const scheduleAddresses = await theGraphClient.request(
      GET_YIELD_SCHEDULE_ADDRESS_QUERY,
      {
        transactionHash: transactionHash,
      }
    );

    const schedule = scheduleAddresses.tokenFixedYieldSchedules[0]?.id;

    if (!schedule) {
      throw errors.NOT_FOUND({
        message: `No yield schedule found for the transaction ${transactionHash}`,
      });
    }

    await context.portalClient.mutate(
      TOKEN_SET_YIELD_SCHEDULE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        schedule: getEthereumAddress(schedule),
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return updated token data
    return await call(read, { tokenAddress: contract }, { context });
  });
