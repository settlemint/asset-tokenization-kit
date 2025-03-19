"use server";

import { handleChallenge } from "@/lib/challenge";
import { FIXED_YIELD_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { intervalToSeconds, percentageToBasisPoints } from "@/lib/utils/yield";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { SetYieldScheduleSchema } from "./set-yield-schedule-schema";

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

export const setYieldSchedule = action
  .schema(SetYieldScheduleSchema)
  .outputSchema(z.hashes())
  .action(async ({ parsedInput: { address, startTime, endTime, rate, interval, pincode, locale }, ctx: { user } }) => {
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

    return z.hashes().parse([data.FixedYieldFactoryCreate?.transactionHash]);
  });