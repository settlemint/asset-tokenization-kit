/**
 * @fileoverview Test suite for asset symbol validation (ticker symbols)
 * 
 * This test suite validates financial asset ticker symbols with strict formatting rules
 * to ensure compatibility with trading platforms and financial data providers.
 * 
 * Test Strategy:
 * - Format Validation: Uppercase A-Z and numbers 0-9 only (no special characters)
 * - Length Constraints: 1-12 characters (standard ticker length limits)
 * - Character Set: Strict ASCII alphanumeric to prevent Unicode confusion
 * - Type Safety: Branded string type prevents mixing with regular strings
 * - Edge Cases: Single characters, maximum length, special character rejection
 * - Internationalization: Explicitly reject Unicode/emoji to maintain compatibility
 * 
 * STANDARD: Follows exchange ticker symbol conventions (NYSE, NASDAQ, etc.)
 * SECURITY: Strict character validation prevents injection and display issues
 */

import { describe, expect, it } from "bun:test";
import { type AssetSymbol, assetSymbol, getAssetSymbol, isAssetSymbol } from "./asset-symbol";

describe("assetSymbol", () => {
  const validator = assetSymbol();

  describe("valid asset symbols", () => {
    it("should accept valid uppercase symbols", () => {
      // WHY: Standard crypto/stock ticker format (BTC, ETH, AAPL)
      expect(validator.parse("BTC")).toBe("BTC" as AssetSymbol);
      expect(validator.parse("ETH")).toBe("ETH" as AssetSymbol);
      expect(validator.parse("USDT")).toBe("USDT" as AssetSymbol);
    });

    it("should accept symbols with numbers", () => {
      // WHY: Some assets include numbers in their ticker (1INCH token, C98)
      expect(validator.parse("USDC6")).toBe("USDC6" as AssetSymbol);
      expect(validator.parse("1INCH")).toBe("1INCH" as AssetSymbol); // Real DeFi token
      expect(validator.parse("C98")).toBe("C98" as AssetSymbol); // Coin98 token
    });

    it("should accept single character symbols", () => {
      expect(validator.parse("X")).toBe("X" as AssetSymbol);
      expect(validator.parse("1")).toBe("1" as AssetSymbol);
    });

    it("should accept maximum length symbols", () => {
      expect(validator.parse("VERYLONGSYMB")).toBe("VERYLONGSYMB" as AssetSymbol); // 12 chars
    });
  });

  describe("invalid asset symbols", () => {
    it("should reject empty string", () => {
      expect(() => validator.parse("")).toThrow("Asset symbol is required");
    });

    it("should reject symbols longer than 12 characters", () => {
      expect(() => validator.parse("VERYLONGSYMBOL")).toThrow("Asset symbol must not exceed 12 characters");
    });

    it("should reject lowercase letters", () => {
      // STANDARD: Financial tickers are always uppercase by convention
      // WHY: Prevents confusion between BTC (Bitcoin) and btc (invalid)
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
      // SECURITY: Special characters could cause display/parsing issues
      // STANDARD: Pure alphanumeric symbols are universally compatible
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

describe("isAssetSymbol", () => {
  describe("valid inputs", () => {
    it("should return true for valid asset symbols", () => {
      expect(isAssetSymbol("BTC")).toBe(true);
      expect(isAssetSymbol("ETH")).toBe(true);
      expect(isAssetSymbol("USDT")).toBe(true);
      expect(isAssetSymbol("1INCH")).toBe(true);
      expect(isAssetSymbol("C98")).toBe(true);
      expect(isAssetSymbol("X")).toBe(true);
      expect(isAssetSymbol("1")).toBe(true);
      expect(isAssetSymbol("VERYLONGSYMB")).toBe(true); // 12 chars
    });
  });

  describe("invalid inputs", () => {
    it("should return false for empty string", () => {
      expect(isAssetSymbol("")).toBe(false);
    });

    it("should return false for symbols longer than 12 characters", () => {
      expect(isAssetSymbol("VERYLONGSYMBOL")).toBe(false); // 13 chars
      expect(isAssetSymbol("ABCDEFGHIJKLMN")).toBe(false); // 14 chars
    });

    it("should return false for lowercase letters", () => {
      expect(isAssetSymbol("btc")).toBe(false);
      expect(isAssetSymbol("Btc")).toBe(false);
      expect(isAssetSymbol("BTc")).toBe(false);
      expect(isAssetSymbol("bTC")).toBe(false);
    });

    it("should return false for special characters", () => {
      expect(isAssetSymbol("BTC-USD")).toBe(false);
      expect(isAssetSymbol("BTC_USD")).toBe(false);
      expect(isAssetSymbol("BTC.USD")).toBe(false);
      expect(isAssetSymbol("BTC$")).toBe(false);
      expect(isAssetSymbol("BTC@")).toBe(false);
      expect(isAssetSymbol("BTC!")).toBe(false);
      expect(isAssetSymbol("BTC#")).toBe(false);
      expect(isAssetSymbol("BTC%")).toBe(false);
      expect(isAssetSymbol("BTC^")).toBe(false);
      expect(isAssetSymbol("BTC&")).toBe(false);
      expect(isAssetSymbol("BTC*")).toBe(false);
      expect(isAssetSymbol("BTC(")).toBe(false);
      expect(isAssetSymbol("BTC)")).toBe(false);
      expect(isAssetSymbol("BTC+")).toBe(false);
      expect(isAssetSymbol("BTC=")).toBe(false);
      expect(isAssetSymbol("BTC[")).toBe(false);
      expect(isAssetSymbol("BTC]")).toBe(false);
      expect(isAssetSymbol("BTC{")).toBe(false);
      expect(isAssetSymbol("BTC}")).toBe(false);
      expect(isAssetSymbol("BTC|")).toBe(false);
      expect(isAssetSymbol("BTC\\")).toBe(false);
      expect(isAssetSymbol("BTC;")).toBe(false);
      expect(isAssetSymbol("BTC:")).toBe(false);
      expect(isAssetSymbol("BTC'")).toBe(false);
      expect(isAssetSymbol('BTC"')).toBe(false);
      expect(isAssetSymbol("BTC,")).toBe(false);
      expect(isAssetSymbol("BTC<")).toBe(false);
      expect(isAssetSymbol("BTC>")).toBe(false);
      expect(isAssetSymbol("BTC?")).toBe(false);
      expect(isAssetSymbol("BTC/")).toBe(false);
      expect(isAssetSymbol("BTC~")).toBe(false);
      expect(isAssetSymbol("BTC`")).toBe(false);
    });

    it("should return false for spaces", () => {
      expect(isAssetSymbol("BTC USD")).toBe(false);
      expect(isAssetSymbol(" BTC")).toBe(false);
      expect(isAssetSymbol("BTC ")).toBe(false);
      expect(isAssetSymbol(" ")).toBe(false);
      expect(isAssetSymbol("  ")).toBe(false);
      expect(isAssetSymbol("\tBTC")).toBe(false);
      expect(isAssetSymbol("BTC\t")).toBe(false);
      expect(isAssetSymbol("\nBTC")).toBe(false);
      expect(isAssetSymbol("BTC\n")).toBe(false);
      expect(isAssetSymbol("\rBTC")).toBe(false);
      expect(isAssetSymbol("BTC\r")).toBe(false);
    });

    it("should return false for non-string types", () => {
      expect(isAssetSymbol(123)).toBe(false);
      expect(isAssetSymbol(456.789)).toBe(false);
      expect(isAssetSymbol(0)).toBe(false);
      expect(isAssetSymbol(-1)).toBe(false);
      expect(isAssetSymbol(null)).toBe(false);
      expect(isAssetSymbol(undefined)).toBe(false);
      expect(isAssetSymbol({})).toBe(false);
      expect(isAssetSymbol({ symbol: "BTC" })).toBe(false);
      expect(isAssetSymbol([])).toBe(false);
      expect(isAssetSymbol(["BTC"])).toBe(false);
      expect(isAssetSymbol(true)).toBe(false);
      expect(isAssetSymbol(false)).toBe(false);
      expect(isAssetSymbol(Symbol("BTC"))).toBe(false);
      expect(isAssetSymbol(() => "BTC")).toBe(false);
      expect(isAssetSymbol(new Date())).toBe(false);
      expect(isAssetSymbol(/BTC/)).toBe(false);
      expect(isAssetSymbol(new Error("BTC"))).toBe(false);
      expect(isAssetSymbol(BigInt(123))).toBe(false);
    });

    it("should return false for unicode characters", () => {
      expect(isAssetSymbol("BTC💰")).toBe(false);
      expect(isAssetSymbol("₿TC")).toBe(false);
      expect(isAssetSymbol("БТЦ")).toBe(false); // Cyrillic
      expect(isAssetSymbol("比特币")).toBe(false); // Chinese
      expect(isAssetSymbol("ビットコイン")).toBe(false); // Japanese
      expect(isAssetSymbol("بيتكوين")).toBe(false); // Arabic
    });
  });

  describe("type narrowing", () => {
    it("should properly narrow types in TypeScript", () => {
      const unknownValue: unknown = "BTC";
      if (isAssetSymbol(unknownValue)) {
        // TypeScript should know unknownValue is AssetSymbol here
        const symbol: AssetSymbol = unknownValue;
        expect(symbol).toBe("BTC");
      } else {
        throw new Error("Should have been a valid asset symbol");
      }
    });

    it("should work with mixed type arrays", () => {
      const mixedArray: unknown[] = ["BTC", "eth", 123, null, "ETH", "USDT"];
      const validSymbols = mixedArray.filter((item) => isAssetSymbol(item));
      expect(validSymbols).toEqual(["BTC", "ETH", "USDT"]);
      // TypeScript should know validSymbols is AssetSymbol[]
      validSymbols.forEach((symbol) => {
        expect(symbol).toMatch(/^[A-Z0-9]+$/);
      });
    });
  });
});

describe("getAssetSymbol", () => {
  describe("valid inputs", () => {
    it("should return valid asset symbols", () => {
      expect(getAssetSymbol("BTC")).toBe("BTC");
      expect(getAssetSymbol("ETH")).toBe("ETH");
      expect(getAssetSymbol("USDT")).toBe("USDT");
      expect(getAssetSymbol("1INCH")).toBe("1INCH");
      expect(getAssetSymbol("C98")).toBe("C98");
      expect(getAssetSymbol("X")).toBe("X");
      expect(getAssetSymbol("1")).toBe("1");
      expect(getAssetSymbol("VERYLONGSYMB")).toBe("VERYLONGSYMB"); // 12 chars
    });

    it("should return proper type", () => {
      const result: AssetSymbol = getAssetSymbol("BTC");
      expect(result).toBe("BTC");
    });
  });

  describe("invalid inputs", () => {
    it("should throw for empty string", () => {
      expect(() => getAssetSymbol("")).toThrow("Asset symbol is required");
    });

    it("should throw for symbols longer than 12 characters", () => {
      expect(() => getAssetSymbol("VERYLONGSYMBOL")).toThrow("Asset symbol must not exceed 12 characters");
      expect(() => getAssetSymbol("ABCDEFGHIJKLMN")).toThrow("Asset symbol must not exceed 12 characters");
    });

    it("should throw for lowercase letters", () => {
      expect(() => getAssetSymbol("btc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("Btc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTc")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("bTC")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should throw for special characters", () => {
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
      expect(() => getAssetSymbol("BTC@")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTC!")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should throw for spaces", () => {
      expect(() => getAssetSymbol("BTC USD")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol(" BTC")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("BTC ")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol(" ")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });

    it("should throw for non-string types", () => {
      expect(() => getAssetSymbol(123)).toThrow();
      expect(() => getAssetSymbol(456.789)).toThrow();
      expect(() => getAssetSymbol(0)).toThrow();
      expect(() => getAssetSymbol(null)).toThrow();
      expect(() => getAssetSymbol(undefined)).toThrow();
      expect(() => getAssetSymbol({})).toThrow();
      expect(() => getAssetSymbol({ symbol: "BTC" })).toThrow();
      expect(() => getAssetSymbol([])).toThrow();
      expect(() => getAssetSymbol(["BTC"])).toThrow();
      expect(() => getAssetSymbol(true)).toThrow();
      expect(() => getAssetSymbol(false)).toThrow();
      expect(() => getAssetSymbol(Symbol("BTC"))).toThrow();
      expect(() => getAssetSymbol(() => "BTC")).toThrow();
      expect(() => getAssetSymbol(new Date())).toThrow();
      expect(() => getAssetSymbol(/BTC/)).toThrow();
      expect(() => getAssetSymbol(new Error("BTC"))).toThrow();
      expect(() => getAssetSymbol(BigInt(123))).toThrow();
    });

    it("should throw for unicode characters", () => {
      expect(() => getAssetSymbol("BTC💰")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("₿TC")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("БТЦ")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("比特币")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("ビットコイン")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
      expect(() => getAssetSymbol("بيتكوين")).toThrow(
        "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
      );
    });
  });

  describe("error handling", () => {
    it("should throw ZodError with proper structure", () => {
      try {
        getAssetSymbol("btc");
        throw new Error("Should have thrown");
      } catch (error) {
        expect(error).toHaveProperty("issues");
        expect(error).toHaveProperty("name", "ZodError");
      }
    });

    it("should provide meaningful error messages", () => {
      try {
        getAssetSymbol("");
      } catch (error) {
        expect((error as Error & { issues: Array<{ message: string }> }).issues[0]?.message).toBe(
          "Asset symbol is required"
        );
      }

      try {
        getAssetSymbol("VERYLONGSYMBOL");
      } catch (error) {
        expect((error as Error & { issues: Array<{ message: string }> }).issues[0]?.message).toBe(
          "Asset symbol must not exceed 12 characters"
        );
      }

      try {
        getAssetSymbol("btc");
      } catch (error) {
        expect((error as Error & { issues: Array<{ message: string }> }).issues[0]?.message).toBe(
          "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
        );
      }
    });
  });
});
