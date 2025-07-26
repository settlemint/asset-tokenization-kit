import { describe, expect, it } from "vitest";
import { assetSymbol, type AssetSymbol } from "./asset-symbol";

describe("assetSymbol", () => {
  const validator = assetSymbol();

  describe("valid asset symbols", () => {
    it("should accept valid uppercase symbols", () => {
      expect(validator.parse("BTC")).toBe("BTC" as AssetSymbol);
      expect(validator.parse("ETH")).toBe("ETH" as AssetSymbol);
      expect(validator.parse("USDT")).toBe("USDT" as AssetSymbol);
    });

    it("should accept symbols with numbers", () => {
      expect(validator.parse("USDC6")).toBe("USDC6" as AssetSymbol);
      expect(validator.parse("1INCH")).toBe("1INCH" as AssetSymbol);
      expect(validator.parse("C98")).toBe("C98" as AssetSymbol);
    });

    it("should accept single character symbols", () => {
      expect(validator.parse("X")).toBe("X" as AssetSymbol);
      expect(validator.parse("1")).toBe("1" as AssetSymbol);
    });

    it("should accept maximum length symbols", () => {
      expect(validator.parse("VERYLONGSYMB")).toBe(
        "VERYLONGSYMB" as AssetSymbol
      ); // 12 chars
    });
  });

  describe("invalid asset symbols", () => {
    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow("Asset symbol is required");
    });

    it("should reject symbols longer than 12 characters", () => {
      expect(() => validator.parse("VERYLONGSYMBOL")).toThrow(
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
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid symbol", () => {
      const result = validator.safeParse("BTC");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("BTC" as AssetSymbol);
      }
    });

    it("should return error for invalid symbol", () => {
      const result = validator.safeParse("btc");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("BTC");
      // Test that the type is correctly inferred
      expect(result).toBe("BTC" as AssetSymbol);
    });
  });
});
