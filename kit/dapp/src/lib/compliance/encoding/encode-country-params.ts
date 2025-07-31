import { encodeAbiParameters, parseAbiParameters } from "viem";

/**
 * Encodes country parameters for compliance modules that use country-based restrictions
 * @param countries Array of country codes as numbers
 * @returns Encoded ABI parameters as hex string
 */
export const encodeCountryParams = (countries: (string | number)[]) => {
  const numericCountries = countries.map((country) => {
    return Number.parseInt(country.toString(), 10);
  });
  return encodeAbiParameters(parseAbiParameters("uint16[]"), [
    numericCountries,
  ]);
};
