import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import type { StaticDecode } from "@/lib/utils/typebox";
import { t } from "@/lib/utils/typebox";

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
 * TypeBox schema for fixed yield data validation
 */
export const FixedYieldFragmentSchema = t.Object({
  id: t.EthereumAddress(),
  token: t.Object({
    id: t.EthereumAddress(),
    name: t.String(),
    symbol: t.AssetSymbol(),
  }),
  underlyingAsset: t.Object({
    id: t.EthereumAddress(),
    name: t.String(),
    symbol: t.AssetSymbol(),
  }),
  startDate: t.StringifiedBigInt(),
  endDate: t.StringifiedBigInt(),
  rate: t.StringifiedBigInt(),
  interval: t.StringifiedBigInt(),
  totalClaimed: t.BigDecimal(),
  totalClaimedExact: t.StringifiedBigInt(),
  unclaimedYield: t.BigDecimal(),
  unclaimedYieldExact: t.StringifiedBigInt(),
  underlyingBalance: t.BigDecimal(),
  underlyingBalanceExact: t.StringifiedBigInt(),
  periods: t.Array(
    t.Object({
      id: t.String(),
      periodId: t.StringifiedBigInt(),
      startDate: t.StringifiedBigInt(),
      endDate: t.StringifiedBigInt(),
      rate: t.StringifiedBigInt(),
      totalClaimed: t.BigDecimal(),
      totalClaimedExact: t.StringifiedBigInt(),
    })
  ),
});

export type FixedYield = StaticDecode<typeof FixedYieldFragmentSchema>;
