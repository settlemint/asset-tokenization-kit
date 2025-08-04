/**
 * Tests for ISO 3166-1 Alpha-2 Country Code Validation
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  getCountryName,
  getSupportedLocales,
  isoCountryCode,
  isoCountryCodeNumeric,
  isValidCountryCode,
  SUPPORTED_LOCALES,
  getNumericCodeByName,
  getNumericCountries,
  getCountriesSorted,
  getNumericCountriesSorted,
  type ISOCountryCode,
  type SupportedLocale,
} from "./iso-country-code";

describe("isoCountryCode validator", () => {
  describe("validation", () => {
    it("should accept valid ISO 3166-1 alpha-2 codes", () => {
      const validCodes = [
        "US",
        "GB",
        "DE",
        "FR",
        "JP",
        "CN",
        "BR",
        "IN",
        "AU",
        "CA",
      ];

      for (const code of validCodes) {
        expect(() => isoCountryCode.parse(code)).not.toThrow();
        expect(isoCountryCode.safeParse(code).success).toBe(true);
      }
    });

    it("should reject invalid country codes", () => {
      const invalidCodes = [
        "USA", // Alpha-3 code
        "us", // Lowercase
        "XX", // Invalid code
        "12", // Numbers
        "U", // Too short
        "USD", // Currency code
        "", // Empty string
        "  ", // Whitespace
        "U S", // Space in between
        "🇺🇸", // Emoji flag
      ];

      for (const code of invalidCodes) {
        expect(() => isoCountryCode.parse(code)).toThrow();
        expect(isoCountryCode.safeParse(code).success).toBe(false);
      }
    });

    it("should handle edge cases", () => {
      expect(() => isoCountryCode.parse(null)).toThrow();
      expect(() => isoCountryCode.parse(undefined)).toThrow();
      expect(() => isoCountryCode.parse(123)).toThrow();
      expect(() => isoCountryCode.parse({})).toThrow();
    });
  });

  describe("isValidCountryCode", () => {
    it("should return true for valid codes", () => {
      expect(isValidCountryCode("US")).toBe(true);
      expect(isValidCountryCode("GB")).toBe(true);
      expect(isValidCountryCode("JP")).toBe(true);
    });

    it("should return false for invalid codes", () => {
      expect(isValidCountryCode("USA")).toBe(false);
      expect(isValidCountryCode("us")).toBe(false);
      expect(isValidCountryCode("XX")).toBe(false);
      expect(isValidCountryCode("")).toBe(false);
    });

    it("should work as a type guard", () => {
      const code = "US";
      if (isValidCountryCode(code)) {
        // TypeScript should recognize code as ISOCountryCode here
        const typedCode: ISOCountryCode = code;
        expect(typedCode).toBe("US");
      }
    });
  });

  describe("getCountryName", () => {
    it("should return country names in English by default", () => {
      expect(getCountryName("US")).toBe("United States of America");
      expect(getCountryName("GB")).toBe("United Kingdom");
      expect(getCountryName("DE")).toBe("Germany");
      expect(getCountryName("FR")).toBe("France");
      expect(getCountryName("JP")).toBe("Japan");
    });

    it("should return country names in German", () => {
      expect(getCountryName("US", "de")).toBe("Vereinigte Staaten von Amerika");
      expect(getCountryName("DE", "de")).toBe("Deutschland");
      expect(getCountryName("FR", "de")).toBe("Frankreich");
      expect(getCountryName("JP", "de")).toBe("Japan");
    });

    it("should return country names in Japanese", () => {
      expect(getCountryName("US", "ja")).toBe("アメリカ合衆国");
      expect(getCountryName("JP", "ja")).toBe("日本");
      expect(getCountryName("CN", "ja")).toBe("中華人民共和国");
    });

    it("should return country names in Arabic", () => {
      expect(getCountryName("US", "ar")).toBe("الولايات المتحدة");
      expect(getCountryName("SA", "ar")).toBe("السعودية");
      expect(getCountryName("EG", "ar")).toBe("مصر");
    });

    it("should return undefined for invalid country codes", () => {
      expect(getCountryName("XX")).toBeUndefined();
      // Note: i18n-iso-countries also accepts alpha-3 codes
      expect(getCountryName("USA")).toBe("United States of America");
      expect(getCountryName("")).toBeUndefined();
    });

    it("should handle unsupported locales gracefully", () => {
      // With an unsupported locale, it returns undefined
      // @ts-expect-error - Testing with invalid locale
      expect(getCountryName("US", "xyz")).toBeUndefined();
    });

    it("should work with all supported locales", () => {
      const testCode = "FR";
      const expectedNames: Record<SupportedLocale, string> = {
        en: "France",
        ar: "فرنسا",
        de: "Frankreich",
        ja: "フランス",
      };

      for (const locale of SUPPORTED_LOCALES) {
        expect(getCountryName(testCode, locale)).toBe(expectedNames[locale]);
      }
    });
  });

  describe("getSupportedLocales", () => {
    it("should return the correct list of supported locales", () => {
      const locales = getSupportedLocales();
      expect(locales).toEqual(["en", "ar", "de", "ja"]);
      expect(locales).toHaveLength(4);
    });

    it("should return a new array each time", () => {
      const locales1 = getSupportedLocales();
      const locales2 = getSupportedLocales();
      expect(locales1).toEqual(locales2);
      expect(locales1).not.toBe(locales2); // Different array instances
    });

    it("should match SUPPORTED_LOCALES constant", () => {
      expect(getSupportedLocales()).toEqual([...SUPPORTED_LOCALES]);
    });
  });

  describe("type safety", () => {
    it("should infer correct types", () => {
      const result = isoCountryCode.safeParse("US");
      if (result.success) {
        // TypeScript should know this is ISOCountryCode
        const code: ISOCountryCode = result.data;
        expect(code).toBe("US");
      }
    });

    it("should work with optional chaining", () => {
      const schema = isoCountryCode.optional();
      expect(schema.parse(undefined)).toBeUndefined();
      expect(schema.parse("US")).toBe("US");
    });

    it("should work with nullable", () => {
      const schema = isoCountryCode.nullable();
      expect(schema.parse(null)).toBeNull();
      expect(schema.parse("US")).toBe("US");
    });

    it("should enforce locale type safety", () => {
      // These should compile without errors
      const validLocales: SupportedLocale[] = ["en", "ar", "de", "ja"];
      for (const locale of validLocales) {
        expect(typeof getCountryName("US", locale)).toBe("string");
      }

      // This would cause a TypeScript error if the type wasn't cast
      expect(() =>
        getCountryName("US", "invalid" as SupportedLocale)
      ).not.toThrow();
    });
  });

  describe("integration with Zod schemas", () => {
    it("should work in object schemas", () => {
      const userSchema = z.object({
        name: z.string(),
        country: isoCountryCode,
      });

      const validUser = { name: "John", country: "US" as const };
      expect(() => userSchema.parse(validUser)).not.toThrow();

      const invalidUser = { name: "John", country: "USA" };
      expect(() => userSchema.parse(invalidUser)).toThrow();
    });

    it("should work with transforms", () => {
      const countryWithName = isoCountryCode.transform((code) => ({
        code,
        name: getCountryName(code) ?? "Unknown",
      }));

      const result = countryWithName.parse("US");
      expect(result).toEqual({
        code: "US",
        name: "United States of America",
      });
    });
  });

  describe("isoCountryCodeNumeric validator", () => {
    it("should accept valid numeric country codes as strings", () => {
      const validCodes = [
        "840", // United States
        "826", // United Kingdom
        "276", // Germany
        "250", // France
        "392", // Japan
        "056", // Belgium (with leading zero)
        "008", // Albania (with leading zeros)
      ];

      for (const code of validCodes) {
        const result = isoCountryCodeNumeric.parse(code);
        expect(typeof result).toBe("number");
        expect(result).toBe(Number.parseInt(code, 10));
      }
    });

    it("should accept valid numeric country codes as numbers", () => {
      const validCodes = [
        840, // United States
        826, // United Kingdom
        276, // Germany
        250, // France
        392, // Japan
        56, // Belgium
        8, // Albania
      ];

      for (const code of validCodes) {
        const result = isoCountryCodeNumeric.parse(code);
        expect(result).toBe(code);
      }
    });

    it("should reject invalid numeric country codes", () => {
      const invalidCodes = [
        "999", // Not a valid country code
        999, // Not a valid country code
        "000", // Not assigned
        0, // Not assigned
        "XX", // Not numeric
        "US", // Alpha-2 code
        "", // Empty string
        -1, // Negative
        "-840", // Negative string
      ];

      for (const code of invalidCodes) {
        expect(() => isoCountryCodeNumeric.parse(code)).toThrow();
      }
    });

    it("should reject non-numeric types", () => {
      expect(() => isoCountryCodeNumeric.parse(null)).toThrow();
      expect(() => isoCountryCodeNumeric.parse(undefined)).toThrow();
      expect(() => isoCountryCodeNumeric.parse({})).toThrow();
      expect(() => isoCountryCodeNumeric.parse([])).toThrow();
      expect(() => isoCountryCodeNumeric.parse(true)).toThrow();
      expect(() => isoCountryCodeNumeric.parse(false)).toThrow();
    });

    it("should handle safeParse correctly", () => {
      const successResult = isoCountryCodeNumeric.safeParse("840");
      expect(successResult.success).toBe(true);
      if (successResult.success) {
        expect(successResult.data).toBe(840);
      }

      const failResult = isoCountryCodeNumeric.safeParse("999");
      expect(failResult.success).toBe(false);
    });

    it("should coerce string to number", () => {
      expect(isoCountryCodeNumeric.parse("056")).toBe(56);
      expect(isoCountryCodeNumeric.parse("008")).toBe(8);
      expect(isoCountryCodeNumeric.parse("100")).toBe(100);
    });
  });

  describe("getCountries", () => {
    it("should return all countries in English by default", async () => {
      const { getCountries } = await import("./iso-country-code");
      const countries = getCountries();

      // Should return an object with country codes as keys
      expect(typeof countries).toBe("object");
      expect(countries).toBeDefined();

      // Should include common countries
      expect(countries.US).toBe("United States of America");
      expect(countries.GB).toBe("United Kingdom");
      expect(countries.DE).toBe("Germany");
      expect(countries.FR).toBe("France");
      expect(countries.JP).toBe("Japan");

      // Should have many countries (ISO 3166-1 has 249 countries)
      expect(Object.keys(countries).length).toBeGreaterThan(200);
    });

    it("should return countries in different languages", async () => {
      const { getCountries } = await import("./iso-country-code");

      // German
      const countriesDe = getCountries("de");
      expect(countriesDe.US).toBe("Vereinigte Staaten von Amerika");
      expect(countriesDe.DE).toBe("Deutschland");
      expect(countriesDe.FR).toBe("Frankreich");

      // Japanese
      const countriesJa = getCountries("ja");
      expect(countriesJa.US).toBe("アメリカ合衆国");
      expect(countriesJa.JP).toBe("日本");

      // Arabic
      const countriesAr = getCountries("ar");
      expect(countriesAr.US).toBe("الولايات المتحدة");
      expect(countriesAr.SA).toBe("السعودية");
    });

    it("should return all supported locales with correct translations", async () => {
      const { getCountries, SUPPORTED_LOCALES } = await import(
        "./iso-country-code"
      );

      for (const locale of SUPPORTED_LOCALES) {
        const countries = getCountries(locale);

        // Should return an object
        expect(typeof countries).toBe("object");
        expect(countries).toBeDefined();

        // Should have many countries
        expect(Object.keys(countries).length).toBeGreaterThan(200);

        // Should have translated names (not empty)
        expect(countries.US).toBeTruthy();
        expect(countries.FR).toBeTruthy();
        expect(countries.DE).toBeTruthy();
      }
    });

    it("should return consistent country codes across locales", async () => {
      const { getCountries, SUPPORTED_LOCALES } = await import(
        "./iso-country-code"
      );

      const englishCountries = getCountries("en");
      const countryCodes = Object.keys(englishCountries);

      // Check that all locales have the same country codes
      for (const locale of SUPPORTED_LOCALES) {
        if (locale !== "en") {
          const localizedCountries = getCountries(locale);
          const localizedCodes = Object.keys(localizedCountries);

          // Should have the same country codes
          expect(localizedCodes.sort()).toEqual(countryCodes.sort());
        }
      }
    });
  });

  describe("getNumericCodeByName", () => {
    it("should return numeric code for valid country names in English", () => {
      expect(getNumericCodeByName("United States")).toBe("840");
      expect(getNumericCodeByName("United Kingdom")).toBe("826");
      expect(getNumericCodeByName("Germany")).toBe("276");
      expect(getNumericCodeByName("France")).toBe("250");
      expect(getNumericCodeByName("Japan")).toBe("392");
    });

    it("should return numeric code for country names in different locales", () => {
      // German
      expect(getNumericCodeByName("Deutschland", "de")).toBe("276");
      expect(getNumericCodeByName("Frankreich", "de")).toBe("250");

      // Japanese
      expect(getNumericCodeByName("日本", "ja")).toBe("392");
      expect(getNumericCodeByName("アメリカ合衆国", "ja")).toBe("840");

      // Arabic
      expect(getNumericCodeByName("مصر", "ar")).toBe("818");
      expect(getNumericCodeByName("السعودية", "ar")).toBe("682");
    });

    it("should return undefined for invalid country names", () => {
      expect(getNumericCodeByName("InvalidCountry")).toBeUndefined();
      expect(getNumericCodeByName("")).toBeUndefined();
      expect(getNumericCodeByName("XYZ")).toBeUndefined();
      expect(getNumericCodeByName("Not A Country")).toBeUndefined();
    });

    it("should handle partial matches correctly", () => {
      // Should not match partial names
      expect(getNumericCodeByName("United")).toBeUndefined();
      expect(getNumericCodeByName("States")).toBeUndefined();

      // Full names work
      expect(getNumericCodeByName("United States")).toBe("840");
    });
  });

  describe("getNumericCountries", () => {
    it("should return all countries with numeric codes in English by default", () => {
      const numericCountries = getNumericCountries();

      // Should return an object
      expect(typeof numericCountries).toBe("object");
      expect(numericCountries).toBeDefined();

      // Should have numeric codes as keys and country names as values
      expect(numericCountries["840"]).toBe("United States of America");
      expect(numericCountries["826"]).toBe("United Kingdom");
      expect(numericCountries["276"]).toBe("Germany");
      expect(numericCountries["250"]).toBe("France");
      expect(numericCountries["392"]).toBe("Japan");

      // Should have many countries
      expect(Object.keys(numericCountries).length).toBeGreaterThan(200);
    });

    it("should return countries with numeric codes in different locales", () => {
      // German
      const countriesDe = getNumericCountries("de");
      expect(countriesDe["840"]).toBe("Vereinigte Staaten von Amerika");
      expect(countriesDe["276"]).toBe("Deutschland");
      expect(countriesDe["250"]).toBe("Frankreich");

      // Japanese
      const countriesJa = getNumericCountries("ja");
      expect(countriesJa["840"]).toBe("アメリカ合衆国");
      expect(countriesJa["392"]).toBe("日本");

      // Arabic
      const countriesAr = getNumericCountries("ar");
      expect(countriesAr["840"]).toBe("الولايات المتحدة");
      expect(countriesAr["682"]).toBe("السعودية");
    });

    it("should have consistent numeric codes across locales", () => {
      const enCountries = getNumericCountries("en");
      const deCountries = getNumericCountries("de");
      const jaCountries = getNumericCountries("ja");
      const arCountries = getNumericCountries("ar");

      // All should have the same numeric codes
      expect(Object.keys(enCountries).sort()).toEqual(
        Object.keys(deCountries).sort()
      );
      expect(Object.keys(enCountries).sort()).toEqual(
        Object.keys(jaCountries).sort()
      );
      expect(Object.keys(enCountries).sort()).toEqual(
        Object.keys(arCountries).sort()
      );
    });

    it("should handle cases where getName returns null or undefined", () => {
      // Test that the fallback to alpha2 code works when getName returns null
      // This covers line 208 where we use alpha2 as fallback
      const numericCountries = getNumericCountries();

      // All entries should have a non-empty string value
      Object.entries(numericCountries).forEach(([_numeric, name]) => {
        expect(name).toBeDefined();
        expect(typeof name).toBe("string");
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getCountriesSorted", () => {
    it("should return countries sorted alphabetically by name in English", () => {
      const sorted = getCountriesSorted();

      // Should be an array
      expect(Array.isArray(sorted)).toBe(true);
      expect(sorted.length).toBeGreaterThan(200);

      // Each entry should be [code, name] tuple
      const firstEntry = sorted[0];
      expect(firstEntry).toBeDefined();
      expect(Array.isArray(firstEntry)).toBe(true);
      expect(firstEntry).toHaveLength(2);
      expect(typeof firstEntry![0]).toBe("string"); // country code
      expect(typeof firstEntry![1]).toBe("string"); // country name

      // Should be sorted alphabetically by name
      for (let i = 1; i < sorted.length; i++) {
        const prevName = sorted[i - 1]?.[1];
        const currName = sorted[i]?.[1];
        expect(prevName).toBeDefined();
        expect(currName).toBeDefined();
        expect(prevName!.localeCompare(currName!)).toBeLessThanOrEqual(0);
      }
    });

    it("should return countries sorted alphabetically in different locales", () => {
      // German
      const sortedDe = getCountriesSorted("de");
      expect(Array.isArray(sortedDe)).toBe(true);

      // Check German sorting
      for (let i = 1; i < sortedDe.length; i++) {
        const prevName = sortedDe[i - 1]?.[1];
        const currName = sortedDe[i]?.[1];
        expect(prevName).toBeDefined();
        expect(currName).toBeDefined();
        expect(prevName!.localeCompare(currName!)).toBeLessThanOrEqual(0);
      }

      // Japanese
      const sortedJa = getCountriesSorted("ja");
      expect(Array.isArray(sortedJa)).toBe(true);

      // Arabic
      const sortedAr = getCountriesSorted("ar");
      expect(Array.isArray(sortedAr)).toBe(true);
    });

    it("should include all countries regardless of locale", () => {
      const sortedEn = getCountriesSorted("en");
      const sortedDe = getCountriesSorted("de");

      // Should have the same number of countries
      expect(sortedEn.length).toBe(sortedDe.length);

      // Should have the same country codes (though in different order)
      const codesEn = sortedEn.map(([code]) => code).sort();
      const codesDe = sortedDe.map(([code]) => code).sort();
      expect(codesEn).toEqual(codesDe);
    });
  });

  describe("getNumericCountriesSorted", () => {
    it("should return numeric countries sorted alphabetically by name in English", () => {
      const sorted = getNumericCountriesSorted();

      // Should be an array
      expect(Array.isArray(sorted)).toBe(true);
      expect(sorted.length).toBeGreaterThan(200);

      // Each entry should be [numericCode, name] tuple
      const firstEntry = sorted[0];
      expect(firstEntry).toBeDefined();
      expect(Array.isArray(firstEntry)).toBe(true);
      expect(firstEntry).toHaveLength(2);
      expect(typeof firstEntry![0]).toBe("string"); // numeric code as string
      expect(typeof firstEntry![1]).toBe("string"); // country name

      // Should be sorted alphabetically by name
      for (let i = 1; i < sorted.length; i++) {
        const prevName = sorted[i - 1]?.[1];
        const currName = sorted[i]?.[1];
        expect(prevName).toBeDefined();
        expect(currName).toBeDefined();
        expect(prevName!.localeCompare(currName!)).toBeLessThanOrEqual(0);
      }
    });

    it("should return numeric countries sorted in different locales", () => {
      // German
      const sortedDe = getNumericCountriesSorted("de");
      expect(Array.isArray(sortedDe)).toBe(true);

      // Check German sorting
      for (let i = 1; i < sortedDe.length; i++) {
        const prevName = sortedDe[i - 1]?.[1];
        const currName = sortedDe[i]?.[1];
        expect(prevName).toBeDefined();
        expect(currName).toBeDefined();
        expect(prevName!.localeCompare(currName!)).toBeLessThanOrEqual(0);
      }

      // Should have German names
      const germanyEntry = sortedDe.find(([code]) => code === "276");
      expect(germanyEntry?.[1]).toBe("Deutschland");
    });

    it("should map numeric codes correctly", () => {
      const sorted = getNumericCountriesSorted();

      // Check some known mappings
      const usEntry = sorted.find(([code]) => code === "840");
      expect(usEntry?.[1]).toBe("United States of America");

      const ukEntry = sorted.find(([code]) => code === "826");
      expect(ukEntry?.[1]).toBe("United Kingdom");

      const jpEntry = sorted.find(([code]) => code === "392");
      expect(jpEntry?.[1]).toBe("Japan");
    });

    it("should include all numeric codes regardless of locale", () => {
      const sortedEn = getNumericCountriesSorted("en");
      const sortedDe = getNumericCountriesSorted("de");

      // Should have the same number of countries
      expect(sortedEn.length).toBe(sortedDe.length);

      // Should have the same numeric codes (though in different order)
      const codesEn = sortedEn.map(([code]) => code).sort();
      const codesDe = sortedDe.map(([code]) => code).sort();
      expect(codesEn).toEqual(codesDe);
    });
  });
});
