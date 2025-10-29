import { TimeIntervalEnum } from "@atk/zod/time-interval";
import type { DemoAsset } from "@test/scripts/demo/data/demo-assets";
import { SG_COUNTRY_CODE } from "@test/scripts/demo/data/demo-country-codes";
import { from, type Dnum } from "dnum";

type DemoBond = DemoAsset & {
  yieldRate: number;
  faceValue: Dnum;
  cap: Dnum;
  issueDate: Date;
  maturityDate: Date;
  paymentInterval: keyof typeof TimeIntervalEnum | number;
};

const fiveMinutesFromNow = new Date();
fiveMinutesFromNow.setMilliseconds(0);
fiveMinutesFromNow.setSeconds(0);
fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);

const thirtyMinutesFromNow = new Date();
thirtyMinutesFromNow.setMilliseconds(0);
thirtyMinutesFromNow.setSeconds(0);
thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30);

const threeAndAHalfHoursFromNow = new Date();
threeAndAHalfHoursFromNow.setMilliseconds(0);
threeAndAHalfHoursFromNow.setSeconds(0);
threeAndAHalfHoursFromNow.setMinutes(
  threeAndAHalfHoursFromNow.getMinutes() + 210
);

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
    name: "A1SG Bond 2025",
    symbol: "A1SG25",
    decimals: 18,
    faceValue: from(1000, 18),
    yieldRate: 110,
    isin: undefined,
    countryCode: SG_COUNTRY_CODE,
    cap: from(10_000, 18),
    issueDate: fiveMinutesFromNow,
    maturityDate: threeAndAHalfHoursFromNow,
    paymentInterval: 3_600, // 1 hour
  },
] satisfies DemoBond[];
