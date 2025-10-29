import type { DemoAsset } from "@test/scripts/demo/data/demo-assets";
import { SG_COUNTRY_CODE } from "@test/scripts/demo/data/demo-country-codes";
import { from, type Dnum } from "dnum";

type DemoStablecoin = DemoAsset & {
  collateral: Dnum;
  isDenominationToken: true;
};

export const STABLECOINS = [
  {
    name: "Mizuho Stablecoin",
    symbol: "MIS",
    decimals: 18,
    basePrice: from("1.00", 18),
    countryCode: SG_COUNTRY_CODE,
    collateral: from(1_000_000_000, 18),
    isDenominationToken: true,
  },
] satisfies DemoStablecoin[];
