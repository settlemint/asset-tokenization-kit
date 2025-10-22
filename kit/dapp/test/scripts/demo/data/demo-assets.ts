import type { Dnum } from "dnum";

export type DemoAsset = {
  name: string;
  symbol: string;
  decimals: number;
  isin?: string;
  countryCode: string;
  basePrice?: Dnum;
  compliance?: {
    allowedCountries?: string[];
    tokenSupplyLimit?: Dnum;
  };
};

export * from "./demo-bonds";
export * from "./demo-deposits";
export * from "./demo-stablecoins";
