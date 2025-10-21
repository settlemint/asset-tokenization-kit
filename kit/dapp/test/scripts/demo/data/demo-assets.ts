import { TimeIntervalEnum } from "@atk/zod/time-interval";
import {
  DE_COUNTRY_CODE,
  JP_COUNTRY_CODE,
} from "@test/scripts/demo/data/demo-country-codes";
import { from } from "dnum";

const fiveMinutesFromNow = new Date();
fiveMinutesFromNow.setMilliseconds(0);
fiveMinutesFromNow.setSeconds(0);
fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);

const thirtyMinutesFromNow = new Date();
thirtyMinutesFromNow.setMilliseconds(0);
thirtyMinutesFromNow.setSeconds(0);
thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30);

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
    issueDate: fiveMinutesFromNow,
    maturityDate: thirtyMinutesFromNow,
    paymentInterval: 5 * 60, // 5 minutes
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
    paymentInterval: TimeIntervalEnum.YEARLY,
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
    paymentInterval: TimeIntervalEnum.YEARLY,
    countries: [DE_COUNTRY_CODE, JP_COUNTRY_CODE],
  },
];
