import { describe, expect, it } from "bun:test";
import {
  assetSymbol,
  getAssetSymbol,
  isAssetSymbol,
  type AssetSymbol,
} from "./asset-symbol";

describe("assetSymbol", () => {
  const validator = assetSymbol();

  describe("valid asset symbols", () => {
    it("should accept valid uppercase symbols", () => {
      expect(validator.parse("BTC")).toBe(getAssetSymbol("BTC"));
      expect(validator.parse("ETH")).toBe(getAssetSymbol("ETH"));
      expect(validator.parse("USDT")).toBe(getAssetSymbol("USDT"));

      expect(isAssetSymbol("BTC")).toBe(true);
      expect(isAssetSymbol("ETH")).toBe(true);
      expect(isAssetSymbol("USDT")).toBe(true);

      expect(getAssetSymbol("BTC")).toBe(getAssetSymbol("BTC"));
      expect(getAssetSymbol("ETH")).toBe(getAssetSymbol("ETH"));
      expect(getAssetSymbol("USDT")).toBe(getAssetSymbol("USDT"));
    });

    it("should accept symbols with numbers", () => {
      expect(validator.parse("USDC6")).toBe(getAssetSymbol("USDC6"));
      expect(validator.parse("1INCH")).toBe(getAssetSymbol("1INCH"));
      expect(validator.parse("C98")).toBe(getAssetSymbol("C98"));

      expect(isAssetSymbol("USDC6")).toBe(true);
      expect(isAssetSymbol("1INCH")).toBe(true);
      expect(isAssetSymbol("C98")).toBe(true);

      expect(getAssetSymbol("USDC6")).toBe(getAssetSymbol("USDC6"));
      expect(getAssetSymbol("1INCH")).toBe(getAssetSymbol("1INCH"));
      expect(getAssetSymbol("C98")).toBe(getAssetSymbol("C98"));
    });

    it("should accept single character symbols", () => {
      expect(validator.parse("X")).toBe(getAssetSymbol("X"));
      expect(validator.parse("1")).toBe(getAssetSymbol("1"));

      expect(isAssetSymbol("X")).toBe(true);
      expect(isAssetSymbol("1")).toBe(true);

      expect(getAssetSymbol("X")).toBe(getAssetSymbol("X"));
      expect(getAssetSymbol("1")).toBe(getAssetSymbol("1"));
    });

    it("should accept maximum length symbols", () => {
      expect(validator.parse("VERYLONGSYMB")).toBe(
        getAssetSymbol("VERYLONGSYMB")
      ); // 12 chars
      expect(isAssetSymbol("VERYLONGSYMB")).toBe(true);
      expect(getAssetSymbol("VERYLONGSYMB")).toBe(
        getAssetSymbol("VERYLONGSYMB")
      );
    });
  });

  describe("invalid asset symbols", () => {
    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow("Asset symbol is required");
      expect(isAssetSymbol("")).toBe(false);
      expect(() => getAssetSymbol("")).toThrow("Asset symbol is required");
    });

    it("should reject symbols longer than 12 characters", () => {
      expect(() => validator.parse("VERYLONGSYMBOL")).toThrow(
        "Asset symbol must not exceed 12 characters"
      );
      expect(isAssetSymbol("VERYLONGSYMBOL")).toBe(false);
      expect(() => getAssetSymbol("VERYLONGSYMBOL")).toThrow(
        "Asset symbol must not exceed 12 characters"
      );
    });

    it("should reject lowercase letters", () => {
      expect(() => validator.parse("btc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("Btc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("BTc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );

      expect(isAssetSymbol("btc")).toBe(false);
      expect(isAssetSymbol("Btc")).toBe(false);
      expect(isAssetSymbol("BTc")).toBe(false);

      expect(() => getAssetSymbol("btc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("Btc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should reject special characters", () => {
      expect(() => validator.parse("BTC-USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("BTC_USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("BTC.USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("BTC$")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );

      expect(isAssetSymbol("BTC-USD")).toBe(false);
      expect(isAssetSymbol("BTC_USD")).toBe(false);
      expect(isAssetSymbol("BTC.USD")).toBe(false);
      expect(isAssetSymbol("BTC$")).toBe(false);

      expect(() => getAssetSymbol("BTC-USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTC_USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTC.USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTC$")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should reject spaces", () => {
      expect(() => validator.parse("BTC USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse(" BTC")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => validator.parse("BTC ")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );

      expect(isAssetSymbol("BTC USD")).toBe(false);
      expect(isAssetSymbol(" BTC")).toBe(false);
      expect(isAssetSymbol("BTC ")).toBe(false);

      expect(() => getAssetSymbol("BTC USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol(" BTC")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTC ")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isAssetSymbol(123)).toBe(false);
      expect(isAssetSymbol(null)).toBe(false);
      expect(isAssetSymbol(undefined)).toBe(false);
      expect(isAssetSymbol({})).toBe(false);

      expect(() => getAssetSymbol(123)).toThrow(
        "Expected string, received number"
      );
      expect(() => getAssetSymbol(null)).toThrow(
        "Expected string, received null"
      );
      expect(() => getAssetSymbol(undefined)).toThrow("Required");
      expect(() => getAssetSymbol({})).toThrow(
        "Expected string, received object"
      );
    });
  });

  describe("safeParse", () => {
    it("should return success for valid symbol", () => {
      const result = validator.safeParse("BTC");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getAssetSymbol("BTC"));
      }
    });

    it("should return error for invalid symbol", () => {
      const result = validator.safeParse("btc");
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isAssetSymbol should work as type guard", () => {
      const value: unknown = "BTC";
      if (isAssetSymbol(value)) {
        // TypeScript should recognize value as AssetSymbol here
        const _typeCheck: AssetSymbol = value;
      }
    });

    it("getAssetSymbol should return typed value", () => {
      const result = getAssetSymbol("ETH");
      // TypeScript should recognize result as AssetSymbol
      const _typeCheck: AssetSymbol = result;
      expect(result).toBe(getAssetSymbol("ETH"));
    });
  });
});
