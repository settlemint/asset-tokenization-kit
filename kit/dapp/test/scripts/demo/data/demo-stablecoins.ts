import type { DemoAsset } from "@test/scripts/demo/data/demo-assets";
import {
  BE_COUNTRY_CODE,
  JP_COUNTRY_CODE,
  US_COUNTRY_CODE,
} from "@test/scripts/demo/data/demo-country-codes";
import { from, type Dnum } from "dnum";

type DemoStablecoin = DemoAsset & {
  collateral: Dnum;
};

export const STABLECOINS = [
  {
    name: "Tether",
    symbol: "USDT",
    decimals: 18,
    basePrice: from("0.86", 18),
    countryCode: US_COUNTRY_CODE,
    collateral: from(1_000_000_000, 18),
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 18,
    basePrice: from("0.86", 18),
    countryCode: US_COUNTRY_CODE,
    collateral: from(1_000_000_000, 18),
  },
  {
    name: "Euro Coin",
    symbol: "EUROC",
    decimals: 18,
    basePrice: from("1.00", 18),
    countryCode: BE_COUNTRY_CODE,
    collateral: from(1_000_000_000, 18),
  },
  {
    name: "STASIS EURO",
    symbol: "EURS",
    decimals: 18,
    basePrice: from(1, 18),
    countryCode: BE_COUNTRY_CODE,
    collateral: from(1_000_000_000, 18),
  },
  {
    name: "JPYC",
    symbol: "JPYC",
    decimals: 18,
    basePrice: from("0.0057", 18),
    countryCode: JP_COUNTRY_CODE,
    collateral: from(1_000_000_000, 18),
  },
  {
    name: "Max Supply (100)",
    symbol: "MAX100",
    decimals: 18,
    basePrice: from(1, 18),
    countryCode: BE_COUNTRY_CODE,
    collateral: from(200, 18),
    compliance: {
      tokenSupplyLimit: from(100, 18),
    },
  },
] satisfies DemoStablecoin[];
