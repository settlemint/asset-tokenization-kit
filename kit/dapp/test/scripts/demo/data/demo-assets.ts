import {
  DE_COUNTRY_CODE,
  JP_COUNTRY_CODE,
} from "@test/scripts/demo/data/demo-country-codes";
import { from } from "dnum";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const dayAfterTomorrow = new Date();
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

const threeYearsFromTomorrow = new Date();
threeYearsFromTomorrow.setFullYear(threeYearsFromTomorrow.getFullYear() + 3);

const fiveYearsFromTomorrow = new Date();
fiveYearsFromTomorrow.setFullYear(fiveYearsFromTomorrow.getFullYear() + 5);

export const BONDS = [
  {
    name: "Short-term bond",
    symbol: "STB",
    yieldRate: 110,
    cap: from(1_000_000_000, 18),
    issueDate: new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    ),
    maturityDate: new Date(
      dayAfterTomorrow.getFullYear(),
      dayAfterTomorrow.getMonth(),
      dayAfterTomorrow.getDate()
    ),
  },
  {
    name: "Bund7",
    symbol: "BUND7",
    isin: "DE000BU27014",
    yieldRate: 250,
    cap: from(8_000_000_000, 18),
    issueDate: new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    ),
    maturityDate: new Date(
      threeYearsFromTomorrow.getFullYear(),
      threeYearsFromTomorrow.getMonth(),
      threeYearsFromTomorrow.getDate()
    ),
    countries: [DE_COUNTRY_CODE],
  },
  {
    name: "Bund10",
    symbol: "BUND10",
    isin: "DE000BU2Z056",
    yieldRate: 260,
    cap: from(26_000_000_000, 18),
    issueDate: new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    ),
    maturityDate: new Date(
      fiveYearsFromTomorrow.getFullYear(),
      fiveYearsFromTomorrow.getMonth(),
      fiveYearsFromTomorrow.getDate()
    ),
    countries: [DE_COUNTRY_CODE, JP_COUNTRY_CODE],
  },
];
