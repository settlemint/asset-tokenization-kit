import {
  getCountriesSorted,
  getNumericCodeByName as getNumericCodeByNameFn,
  getNumericCountriesSorted,
  getSupportedLocales,
  type SupportedLocale,
} from "@atk/zod/validators/iso-country-code";
import countries from "i18n-iso-countries";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type ValueType = "alpha2" | "numeric" | "name";

interface UseCountriesReturn {
  baseLocale: SupportedLocale;
  getCountryOptions: (valueType?: ValueType) => Array<{
    label: string;
    value: string;
  }>;
  getCountryMap: () => Record<string, string>;
  getCountryByNumericCode: (numericCode: string | number) => string | undefined;
  getNumericCodeByName: (name: string) => string | undefined;
}

/**
 * Hook for working with country data and localization
 *
 * This hook provides a centralized way to work with country data across the application,
 * handling locale normalization, country name lookups, and option formatting for form fields.
 *
 * @returns {UseCountriesReturn} Object containing country-related utilities
 *
 * @example
 * ```tsx
 * function CountrySelector() {
 *   const { getCountryOptions } = useCountries();
 *   const options = getCountryOptions('alpha2');
 *
 *   return (
 *     <Select>
 *       {options.map(option => (
 *         <Option key={option.value} value={option.value}>
 *           {option.label}
 *         </Option>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Converting between numeric codes and names
 * function CountryDisplay({ numericCode }: { numericCode: string }) {
 *   const { getCountryByNumericCode } = useCountries();
 *   const countryName = getCountryByNumericCode(numericCode);
 *
 *   return <span>{countryName || 'Unknown'}</span>;
 * }
 * ```
 */
export function useCountries(): UseCountriesReturn {
  const { i18n } = useTranslation();

  const baseLocale = useMemo(() => {
    // Map locale codes like "en-US" to "en"
    const lang = i18n.language.split("-")[0];
    return getSupportedLocales().find((l) => l === lang) ?? "en";
  }, [i18n.language]);

  const getCountryOptions = (valueType: ValueType = "alpha2") => {
    if (valueType === "numeric") {
      const numericCountries = getNumericCountriesSorted(baseLocale);
      return numericCountries.map(([numeric, name]) => ({
        label: name,
        value: numeric,
      }));
    }

    const names = getCountriesSorted(baseLocale);
    if (valueType === "name") {
      return names.map(([, name]) => ({
        label: name,
        value: name,
      }));
    }

    return names.map(([code, name]) => ({
      label: name,
      value: code,
    }));
  };

  const getCountryMap = () => {
    return countries.getNames(baseLocale, {
      select: "official",
    });
  };

  const getCountryByNumericCode = (numericCode: string | number) => {
    const numericString = numericCode.toString();
    return countries.getName(numericString, baseLocale);
  };

  const getNumericCodeByName = (name: string) => {
    return getNumericCodeByNameFn(name, baseLocale);
  };

  return {
    baseLocale,
    getCountryOptions,
    getCountryMap,
    getCountryByNumericCode,
    getNumericCodeByName,
  };
}
