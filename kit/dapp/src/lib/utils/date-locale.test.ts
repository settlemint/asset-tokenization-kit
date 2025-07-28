import { describe, expect, test } from "vitest";
import { getDateLocale } from "./date-locale";
import { enUS, de, ar, ja } from "date-fns/locale";

describe("getDateLocale", () => {
  test("returns undefined for undefined locale", () => {
    expect(getDateLocale(undefined)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(getDateLocale("")).toBeUndefined();
  });

  test("returns correct locale for supported language codes", () => {
    expect(getDateLocale("en")).toBe(enUS);
    expect(getDateLocale("de")).toBe(de);
    expect(getDateLocale("ar")).toBe(ar);
    expect(getDateLocale("ja")).toBe(ja);
  });

  test("returns correct locale for full locale strings", () => {
    expect(getDateLocale("en-US")).toBe(enUS);
    expect(getDateLocale("de-DE")).toBe(de);
    expect(getDateLocale("ar-SA")).toBe(ar);
    expect(getDateLocale("ja-JP")).toBe(ja);
  });

  test("falls back to language code for unknown variants", () => {
    expect(getDateLocale("en-GB")).toBe(enUS); // Falls back to en
    expect(getDateLocale("de-AT")).toBe(de); // Falls back to de
    expect(getDateLocale("ar-EG")).toBe(ar); // Falls back to ar
  });

  test("returns undefined for unsupported locales", () => {
    expect(getDateLocale("fr")).toBeUndefined();
    expect(getDateLocale("es")).toBeUndefined();
    expect(getDateLocale("zh")).toBeUndefined();
    expect(getDateLocale("unknown")).toBeUndefined();
  });
});
