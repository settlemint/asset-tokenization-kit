import { t } from "@/lib/utils/typebox";
import { FixedYieldFragmentSchema } from "./fixed-yield-fragment";

/**
 * Schema for fixed yield data
 */
export const FixedYieldSchema = FixedYieldFragmentSchema;

/**
 * TypeBox schema for API documentation
 */
export const FixedYieldTypeBox = t.Object({
  id: t.EthereumAddress(),
  token: t.Object({
    id: t.EthereumAddress(),
    name: t.String(),
    symbol: t.String(),
  }),
  underlyingAsset: t.Object({
    id: t.EthereumAddress(),
    name: t.String(),
    symbol: t.String(),
  }),
  startDate: t.BigInt(),
  endDate: t.BigInt(),
  rate: t.BigInt(),
  interval: t.BigInt(),
  totalClaimed: t.Number(),
  totalClaimedExact: t.BigInt(),
  unclaimedYield: t.Number(),
  unclaimedYieldExact: t.BigInt(),
  underlyingBalance: t.Number(),
  underlyingBalanceExact: t.BigInt(),
  periods: t.Array(
    t.Object({
      id: t.String(),
      periodId: t.BigInt(),
      startDate: t.BigInt(),
      endDate: t.BigInt(),
      rate: t.BigInt(),
      totalClaimed: t.Number(),
      totalClaimedExact: t.BigInt(),
    })
  ),
});
