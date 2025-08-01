import { encodeAbiParameters, parseAbiParameters } from "viem";

/**
 * Encodes country parameters for compliance modules that use country-based restrictions
 * @param countries Array of country codes as numbers
 * @returns Encoded ABI parameters as hex string
 */
export const encodeCountryParams = (countries: (string | number)[]) => {
  const countryCodes = countries.map((country) => {
    return typeof country === "number" ? country : Number.parseInt(country);
  });

  return encodeAbiParameters(parseAbiParameters("uint16[]"), [
    [...new Set(countryCodes)],
  ]);
};
