import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { z } from "@/lib/utils/zod";

/**
 * GraphQL fragment for fixed yield details
 */
export const FixedYieldFragment = theGraphGraphqlKit(`
  fragment FixedYieldFragment on FixedYield {
    id
    token {
      id
      name
      symbol
    }
    underlyingAsset {
      id
      name
      symbol
    }
    startDate
    endDate
    rate
    interval
    totalClaimed
    totalClaimedExact
    unclaimedYield
    unclaimedYieldExact
    underlyingBalance
    underlyingBalanceExact
    periods {
      id
      periodId
      startDate
      endDate
      rate
      totalClaimed
      totalClaimedExact
    }
  }
`);

/**
 * Zod schema for fixed yield data validation
 */
export const FixedYieldFragmentSchema = z.object({
  id: z.address(),
  token: z.object({
    id: z.address(),
    name: z.string(),
    symbol: z.string(),
  }),
  underlyingAsset: z.object({
    id: z.address(),
    name: z.string(),
    symbol: z.string(),
  }),
  startDate: z.string().pipe(z.coerce.bigint()),
  endDate: z.string().pipe(z.coerce.bigint()),
  rate: z.string().pipe(z.coerce.bigint()),
  interval: z.string().pipe(z.coerce.bigint()),
  totalClaimed: z.string().pipe(z.coerce.number()),
  totalClaimedExact: z.string().pipe(z.coerce.bigint()),
  unclaimedYield: z.string().pipe(z.coerce.number()),
  unclaimedYieldExact: z.string().pipe(z.coerce.bigint()),
  underlyingBalance: z.string().pipe(z.coerce.number()),
  underlyingBalanceExact: z.string().pipe(z.coerce.bigint()),
  periods: z.array(
    z.object({
      id: z.string(),
      periodId: z.string().pipe(z.coerce.bigint()),
      startDate: z.string().pipe(z.coerce.bigint()),
      endDate: z.string().pipe(z.coerce.bigint()),
      rate: z.string().pipe(z.coerce.bigint()),
      totalClaimed: z.string().pipe(z.coerce.number()),
      totalClaimedExact: z.string().pipe(z.coerce.bigint()),
    })
  ),
}); 