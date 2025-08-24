import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { AddonFactoryTypeIdEnum } from "@atk/zod/addon-types";
import { ethereumAddress, getEthereumAddress } from "@atk/zod/ethereum-address";
import { timeIntervalToSeconds } from "@atk/zod/time-interval";
import { z } from "zod";

/**
 * Portal GraphQL mutation for creating a fixed yield schedule contract.
 *
 * This mutation deploys a new fixed yield schedule contract through the
 * ATKFixedYieldScheduleFactory addon, configuring the yield parameters
 * and schedule timing according to the provided input.
 */
const CREATE_FIXED_YIELD_SCHEDULE_MUTATION = portalGraphql(`
  mutation CreateFixedYieldSchedule(
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

/**
 * TheGraph query to retrieve the deployed yield schedule contract address
 * from a specific transaction hash.
 *
 * This query is used after the creation transaction to obtain the contract
 * address of the newly deployed fixed yield schedule.
 */
const GET_YIELD_SCHEDULE_ADDRESS_QUERY = theGraphGraphql(`
  query GetYieldScheduleAddress($transactionHash: Bytes!) {
    tokenFixedYieldSchedules(where: {deployedInTransaction: $transactionHash}) {
      id
    }
  }
`);

/**
 * Fixed yield schedule create route handler.
 *
 * Creates a new fixed yield schedule contract with the specified parameters.
 * This endpoint handles the deployment of yield schedule contracts that can
 * be later associated with tokens to enable yield-bearing functionality.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires system access and appropriate addon availability
 * Method: POST /fixed-yield-schedule
 *
 * @param input - Request parameters containing yield schedule configuration
 * @param context - Request context with Portal client and authenticated user
 * @returns Promise<{address: string}> - The deployed contract address
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws NOT_FOUND - If system context or required addons are missing
 * @throws INTERNAL_SERVER_ERROR - If deployment fails or address lookup fails
 *
 * @example
 * ```typescript
 * // Create a new fixed yield schedule
 * const result = await orpc.fixedYieldSchedule.create.mutate({
 *   yieldRate: "500", // 5% in basis points
 *   paymentInterval: TimeIntervalEnum.DAILY, // Daily payments
 *   startTime: "1690876800", // Start timestamp
 *   endTime: "1722499200", // End timestamp
 *   token: "0x1234567890abcdef1234567890abcdef12345678",
 *   countryCode: 840, // USA
 *   walletVerification: {
 *     secretVerificationCode: "123456",
 *     verificationType: "PINCODE"
 *   }
 * });
 *
 * console.log(result.address); // "0xabc123..."
 * ```
 *
 * @see {@link FixedYieldScheduleCreateInputSchema} for input validation
 * @see {@link FixedYieldScheduleCreateOutputSchema} for response structure
 */
export const create = systemRouter.fixedYieldSchedule.create
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.addonCreate,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const {
      yieldRate,
      paymentInterval,
      startTime,
      endTime,
      token,
      countryCode,
      walletVerification,
    } = input;
    const { auth, system } = context;

    if (!system) {
      throw errors.NOT_FOUND({
        message: "System context is missing. Cannot create yield schedule.",
      });
    }

    if (!system.systemAddons) {
      throw errors.NOT_FOUND({
        message:
          "System addons are missing from system context. Cannot create yield schedule.",
      });
    }

    const systemAddons = system.systemAddons;
    const yieldScheduleAddon = systemAddons.find(
      (addon) =>
        addon.typeId === AddonFactoryTypeIdEnum.ATKFixedYieldScheduleFactory
    );

    if (!yieldScheduleAddon) {
      throw errors.NOT_FOUND({
        message: "Yield schedule addon not found in system addons.",
      });
    }

    const sender = auth.user;
    const transactionHash = await context.portalClient.mutate(
      CREATE_FIXED_YIELD_SCHEDULE_MUTATION,
      {
        address: yieldScheduleAddon.id,
        from: sender.wallet,
        endTime: Math.floor(endTime.getTime() / 1000).toString(),
        interval: timeIntervalToSeconds(paymentInterval).toString(),
        rate: yieldRate.toString(),
        startTime: Math.floor(startTime.getTime() / 1000).toString(),
        token: token,
        country: countryCode,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Query TheGraph to get the deployed contract address
    const scheduleAddresses = await context.theGraphClient.query(
      GET_YIELD_SCHEDULE_ADDRESS_QUERY,
      {
        input: { transactionHash },
        output: z.object({
          tokenFixedYieldSchedules: z.array(z.object({ id: ethereumAddress })),
        }),
      }
    );

    const schedules = scheduleAddresses.tokenFixedYieldSchedules;

    if (schedules.length === 0) {
      throw errors.NOT_FOUND({
        message: `No yield schedule found for the transaction ${transactionHash}`,
      });
    }

    if (schedules.length > 1) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: `Multiple yield schedules detected for transaction ${transactionHash}. This scenario requires additional handling logic to determine the appropriate schedule.`,
      });
    }

    const schedule = schedules[0]?.id;

    if (!schedule) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: `No yield schedule found for transaction ${transactionHash}`,
      });
    }

    return {
      address: getEthereumAddress(schedule),
    };
  });
