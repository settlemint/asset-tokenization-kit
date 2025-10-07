import {
  DE_COUNTRY_CODE,
  JP_COUNTRY_CODE,
} from "@test/scripts/demo/data/demo-country-codes";
import { from } from "dnum";

export const BONDS = [
  {
    name: "Bund7",
    symbol: "BUND7",
    isin: "DE000BU27014",
    yieldRate: 250,
    cap: from(8_000_000_000, 18),
    issueDate: new Date(2026, 8, 24),
    maturityDate: new Date(2027, 8, 24),
    countries: [DE_COUNTRY_CODE],
  },
  {
    name: "Bund10",
    symbol: "BUND10",
    isin: "DE000BU2Z056",
    yieldRate: 260,
    cap: from(26_000_000_000, 18),
    issueDate: new Date(2026, 8, 24),
    maturityDate: new Date(2027, 8, 24),
    countries: [DE_COUNTRY_CODE, JP_COUNTRY_CODE],
  },
];
