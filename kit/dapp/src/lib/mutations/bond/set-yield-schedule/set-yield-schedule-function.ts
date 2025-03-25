import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { FIXED_YIELD_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
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
  mutation FixedYieldFactoryCreate($address: String!, $from: String!, $token: String!, $startTime: String!, $endTime: String!, $rate: String!, $interval: String!, $challengeResponse: String!) {
    FixedYieldFactoryCreate(
      address: $address
      from: $from
      input: {token: $token, startTime: $startTime, endTime: $endTime, rate: $rate, interval: $interval}
      challengeResponse: $challengeResponse
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
export async function setYieldScheduleFunction({
  parsedInput: { address, startTime, endTime, rate, interval, pincode, locale },
  ctx: { user },
}: {
  parsedInput: SetYieldScheduleInput;
  ctx: { user: User };
}) {
  const startTimeTimestamp = formatDate(startTime, {
    type: "unixSeconds",
    locale: locale,
  });
  const endTimeTimestamp = formatDate(endTime, {
    type: "unixSeconds",
    locale: locale,
  });

  const data = await portalClient.request(FixedYieldFactoryCreate, {
    address: FIXED_YIELD_FACTORY_ADDRESS,
    from: user.wallet,
    token: address,
    startTime: startTimeTimestamp,
    endTime: endTimeTimestamp,
    rate: percentageToBasisPoints(Number(rate)),
    interval: intervalToSeconds(interval),
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  return safeParse(t.Hashes(), [data.FixedYieldFactoryCreate?.transactionHash]);
}
