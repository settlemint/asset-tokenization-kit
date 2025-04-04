import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { FIXED_YIELD_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { intervalToSeconds, percentageToBasisPoints } from "@/lib/utils/yield";
import type { SetYieldScheduleInput } from "./set-yield-schedule-schema";

/**
 * GraphQL mutation for setting a fixed yield schedule for a bond
 *
 * @remarks
 * Creates a yield schedule through the fixed yield factory
 */
const FixedYieldFactoryCreate = portalGraphql(`
  mutation FixedYieldFactoryCreate(
    $challengeResponse: String!,
    $verificationId: String,
    $address: String!,
    $from: String!,
    $input: FixedYieldFactoryCreateInput!
  ) {
    FixedYieldFactoryCreate(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
      input: $input
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to set a yield schedule for a bond
 *
 * @param input - Validated input for setting the yield schedule
 * @param user - The user initiating the operation
 * @returns The transaction hash
 */
export const setYieldScheduleFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      address,
      startTime,
      endTime,
      rate,
      interval,
      verificationCode,
      verificationType,
    },
    ctx: { user },
  }: {
    parsedInput: SetYieldScheduleInput;
    ctx: { user: User };
  }) => {
    const startTimeTimestamp = formatDate(startTime, {
      type: "unixSeconds",
    });
    const endTimeTimestamp = formatDate(endTime, {
      type: "unixSeconds",
    });

    const data = await portalClient.request(FixedYieldFactoryCreate, {
      address: FIXED_YIELD_FACTORY_ADDRESS,
      from: user.wallet,
      input: {
        token: address,
        startTime: startTimeTimestamp,
        endTime: endTimeTimestamp,
        rate: percentageToBasisPoints(Number(rate)),
        interval: intervalToSeconds(interval),
      },
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    });

    return safeParse(t.Hashes(), [
      data.FixedYieldFactoryCreate?.transactionHash,
    ]);
  }
);
