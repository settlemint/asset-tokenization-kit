import type { DemoAsset } from "@test/scripts/demo/data/demo-assets";
import { BE_COUNTRY_CODE } from "@test/scripts/demo/data/demo-country-codes";
import { from } from "dnum";

type DemoDeposit = DemoAsset & {
  isDenominationToken: boolean;
};

export const DEPOSITS = [
  {
    name: "Proof-of-Deposit",
    symbol: "POD",
    decimals: 18,
    basePrice: from(1, 18),
    countryCode: BE_COUNTRY_CODE,
    isDenominationToken: true,
  },
] satisfies DemoDeposit[];
