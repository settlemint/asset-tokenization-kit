import { theGraphClientKit, theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";
import { FixedYieldFragment, FixedYieldFragmentSchema } from "./fixed-yield-fragment";

/**
 * GraphQL query to fetch a fixed yield schedule by bond address
 */
const FixedYieldQuery = theGraphGraphqlKit(
  `
  query FixedYield($bondAddress: ID!) {
    bond(id: $bondAddress) {
      id
      yieldSchedule {
        ...FixedYieldFragment
      }
    }
  }
`,
  [FixedYieldFragment]
);

interface GetFixedYieldParams {
  bondAddress: Address;
}

/**
 * Fetches fixed yield schedule data for a bond
 *
 * @param params - Object containing the bond address
 * @returns Fixed yield schedule data or null if no yield schedule exists
 */
export const getFixedYield = cache(async ({ bondAddress }: GetFixedYieldParams) => {
  const data = await theGraphClientKit.request(FixedYieldQuery, {
    bondAddress,
  });

  if (!data.bond?.yieldSchedule) {
    return null;
  }

  return safeParseWithLogging(
    FixedYieldFragmentSchema,
    data.bond.yieldSchedule,
    "fixed yield"
  );
});