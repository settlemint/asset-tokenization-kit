import { describe, expect, test } from "bun:test";
import { SETTING_KEYS, settingKeySchema } from "./settings-key";

describe("settingKeySchema", () => {
  test("should accept valid setting keys", () => {
    expect(settingKeySchema.parse("BASE_CURRENCY")).toBe("BASE_CURRENCY");
    expect(settingKeySchema.parse("SYSTEM_ADDRESS")).toBe("SYSTEM_ADDRESS");
  });

  test("should reject invalid setting keys", () => {
    expect(() => settingKeySchema.parse("INVALID_KEY")).toThrow();
    expect(() => settingKeySchema.parse("")).toThrow();
    expect(() => settingKeySchema.parse(null)).toThrow();
    expect(() => settingKeySchema.parse(undefined)).toThrow();
  });

  test("SETTING_KEYS should contain all expected keys", () => {
    expect(SETTING_KEYS).toEqual(["BASE_CURRENCY", "SYSTEM_ADDRESS"]);
    expect(SETTING_KEYS.length).toBe(2);
  });
});
