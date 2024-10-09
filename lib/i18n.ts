import { type AvailableLanguageTag, languageTag } from "@/paraglide/runtime";
import { Middleware, Navigation, PrefixStrategy } from "@inlang/paraglide-next";

const strategy = PrefixStrategy<AvailableLanguageTag>({ prefixDefault: "never" });

export const middleware = Middleware({ strategy });
export const { Link, useRouter, usePathname, redirect, permanentRedirect } = Navigation({ strategy });

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(languageTag(), {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amount);
};

export const formatToken = (amount: number | bigint, decimals: number) => {
  return new Intl.NumberFormat(languageTag(), {
    style: "decimal",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
};

export const formatPercentage = (amount: number | bigint | string) => {
  try {
    const numericValue = Number.parseFloat(amount.toString());
    const dividedValue = numericValue / 100;

    return new Intl.NumberFormat(languageTag(), {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(dividedValue);
  } catch (error) {
    console.error(error, amount);
    return "0%";
  }
};

export function formatLargeNumber(value: string | number | bigint): string {
  const bigIntValue = BigInt(Math.floor(Number(value)));
  const units = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
    "Sextillion",
    "Septillion",
    "Octillion",
    "Nonillion",
    "Decillion",
    "Undecillion",
    "Duodecillion",
    "Tredecillion",
    "Quattuordecillion",
    "Quindecillion",
    "Sexdecillion",
    "Septendecillion",
    "Octodecillion",
    "Novemdecillion",
    "Vigintillion",
  ];
  const divisor = BigInt(1000);

  let unitIndex = 0;
  let scaledValue = bigIntValue;

  while (scaledValue >= divisor && unitIndex < units.length - 1) {
    scaledValue /= divisor;
    unitIndex++;
  }

  return `${scaledValue.toString()} ${units[unitIndex]}`;
}
