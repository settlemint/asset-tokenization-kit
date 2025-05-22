import { t, type StaticDecode } from "@/lib/utils/typebox";
import { getAddress, isAddress } from "viem";
import { z } from "zod";

const ZodEthAddress = z
  .string()
  .refine(
    (value) => {
      return isAddress(value);
    },
    {
      message: "Invalid Ethereum address",
    }
  )
  .transform((value) => getAddress(value));

const ZodERC20Decimals = z.number().int().min(0).max(18);

const ZodAssetType = z.union([
  z.literal("bond"),
  z.literal("cryptocurrency"),
  z.literal("equity"),
  z.literal("fund"),
  z.literal("stablecoin"),
  z.literal("deposit"),
]);

export const ZodPrice = z.object({
  amount: z.number(),
  currency: z.union([
    z.literal("USD"),
    z.literal("EUR"),
    z.literal("GBP"),
    z.literal("CHF"),
    z.literal("JPY"),
    z.literal("AED"),
    z.literal("SGD"),
    z.literal("SAR"),
  ]),
});

export const ZodDnum = z.string();

export type ZDnum = z.infer<typeof ZodDnum>;

const UnderlyingAssetSchemaZod = z.object({
  id: ZodEthAddress,
  symbol: z.string(),
  decimals: ZodERC20Decimals,
  type: ZodAssetType,
  totalSupply: ZodDnum,
});

const YieldPeriodSchemaZod = z.object({
  id: ZodEthAddress,
  periodId: ZodDnum,
  startDate: z.bigint(),
  endDate: z.bigint(),
  totalClaimed: ZodDnum,
  totalClaimedExact: ZodDnum,
  totalYield: ZodDnum,
  totalYieldExact: ZodDnum,
});

export const YieldScheduleSchemaZod = z.object({
  id: ZodEthAddress,
  startDate: z.bigint(),
  endDate: z.bigint(),
  rate: ZodDnum,
  interval: ZodDnum,
  totalClaimed: ZodDnum,
  totalClaimedExact: ZodDnum,
  underlyingAsset: UnderlyingAssetSchemaZod,
  underlyingBalance: ZodDnum,
  underlyingBalanceExact: ZodDnum,
  periods: z.array(YieldPeriodSchemaZod),
});

export const OnChainBondSchemaZod = z.object({
  id: ZodEthAddress,
  name: z.string(),
  symbol: z.string(),
  decimals: ZodERC20Decimals,
  totalSupply: ZodDnum,
  totalSupplyExact: ZodDnum,
  totalBurned: ZodDnum,
  totalBurnedExact: ZodDnum,
  totalHolders: z.bigint(),
  paused: z.boolean(),
  creator: z.object({
    id: ZodEthAddress,
  }),
  underlyingAsset: UnderlyingAssetSchemaZod,
  maturityDate: z.bigint(),

  isMatured: z.boolean(),
  hasSufficientUnderlying: z.boolean(),
  yieldSchedule: YieldScheduleSchemaZod.nullish(),
  redeemedAmount: z.bigint(),
  faceValue: z.bigint(),
  underlyingBalance: ZodDnum,
  underlyingBalanceExact: ZodDnum,
  totalUnderlyingNeeded: ZodDnum,
  totalUnderlyingNeededExact: ZodDnum,
  cap: ZodDnum,
  deployedOn: z.bigint(),
  concentration: ZodDnum,
});

export type OnChainBondSchemaZodType = z.infer<typeof OnChainBondSchemaZod>;

export const OffChainBondSchemaZod = z.object({
  id: ZodEthAddress,
  isin: z.string().nullish(),
});
export const CalculatedBondSchemaZod = z.object({
  price: ZodPrice,
});

export const CalculatedBondSchema = t.Object(
  {
    price: t.Price({
      description: "Price of the bond",
    }),
  },
  {
    description: "Calculated fields for bond tokens",
  }
);
export type CalculatedBond = StaticDecode<typeof CalculatedBondSchema>;

export const BondSchemaZod = z.intersection(
  OnChainBondSchemaZod,
  OffChainBondSchemaZod.partial()
);

export const BondListSchemaZod = z.array(BondSchemaZod);
export type BondListSchemaZodType = z.infer<typeof BondListSchemaZod>;
