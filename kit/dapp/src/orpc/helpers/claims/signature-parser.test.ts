import { describe, expect, it, beforeEach } from "vitest";
import {
  convertValue,
  parseSignature,
  shouldConvertToBigInt,
  clearSignatureCache,
  getSignatureCacheSize,
} from "./signature-parser";

describe("parseSignature", () => {
  it("parses simple signature with single parameter", () => {
    const result = parseSignature("uint256 amount");
    expect(result).toEqual([{ name: "amount", type: "uint256" }]);
  });

  it("parses signature with multiple parameters", () => {
    const result = parseSignature("uint256 amount, string currency, bool active");
    expect(result).toEqual([
      { name: "amount", type: "uint256" },
      { name: "currency", type: "string" },
      { name: "active", type: "bool" },
    ]);
  });

  it("parses signature with array types", () => {
    const result = parseSignature("string[] names, uint256[] amounts");
    expect(result).toEqual([
      { name: "names", type: "string[]" },
      { name: "amounts", type: "uint256[]" },
    ]);
  });

  it("handles empty signature", () => {
    expect(parseSignature("")).toEqual([]);
    expect(parseSignature("   ")).toEqual([]);
  });

  it("handles signature with extra whitespace", () => {
    const result = parseSignature("  uint256   amount  ,  string   currency  ");
    expect(result).toEqual([
      { name: "amount", type: "uint256" },
      { name: "currency", type: "string" },
    ]);
  });

  it("parses bytes types correctly", () => {
    const result = parseSignature("bytes32 hash, bytes data");
    expect(result).toEqual([
      { name: "hash", type: "bytes32" },
      { name: "data", type: "bytes" },
    ]);
  });

  it("parses address type correctly", () => {
    const result = parseSignature("address wallet, uint256 balance");
    expect(result).toEqual([
      { name: "wallet", type: "address" },
      { name: "balance", type: "uint256" },
    ]);
  });

  it("throws error for invalid parameter format", () => {
    expect(() => parseSignature("invalid-parameter")).toThrow(
      "Invalid parameter format: invalid-parameter"
    );
  });

  it("throws error for unsupported type", () => {
    expect(() => parseSignature("unsupported myParam")).toThrow(
      "Unsupported Solidity type: unsupported"
    );
  });

  it("throws error for malformed signature with missing name", () => {
    expect(() => parseSignature("uint256")).toThrow(
      "Invalid parameter format: uint256"
    );
  });

  it("throws error for malformed signature with missing type", () => {
    expect(() => parseSignature("myParam")).toThrow(
      "Invalid parameter format: myParam"
    );
  });

  it("handles various integer types", () => {
    const result = parseSignature("int8 small, int16 medium, int32 large, int64 huge, int128 massive, int256 enormous");
    expect(result).toEqual([
      { name: "small", type: "int8" },
      { name: "medium", type: "int16" },
      { name: "large", type: "int32" },
      { name: "huge", type: "int64" },
      { name: "massive", type: "int128" },
      { name: "enormous", type: "int256" },
    ]);
  });
});

describe("shouldConvertToBigInt", () => {
  it("returns true for BigInt types", () => {
    expect(shouldConvertToBigInt("uint64")).toBe(true);
    expect(shouldConvertToBigInt("uint128")).toBe(true);
    expect(shouldConvertToBigInt("uint256")).toBe(true);
    expect(shouldConvertToBigInt("int64")).toBe(true);
    expect(shouldConvertToBigInt("int128")).toBe(true);
    expect(shouldConvertToBigInt("int256")).toBe(true);
    expect(shouldConvertToBigInt("uint")).toBe(true);
    expect(shouldConvertToBigInt("int")).toBe(true);
  });

  it("returns false for smaller integer types", () => {
    expect(shouldConvertToBigInt("uint8")).toBe(false);
    expect(shouldConvertToBigInt("uint16")).toBe(false);
    expect(shouldConvertToBigInt("uint32")).toBe(false);
    expect(shouldConvertToBigInt("int8")).toBe(false);
    expect(shouldConvertToBigInt("int16")).toBe(false);
    expect(shouldConvertToBigInt("int32")).toBe(false);
  });

  it("returns false for non-integer types", () => {
    expect(shouldConvertToBigInt("bool")).toBe(false);
    expect(shouldConvertToBigInt("string")).toBe(false);
    expect(shouldConvertToBigInt("address")).toBe(false);
    expect(shouldConvertToBigInt("bytes")).toBe(false);
    expect(shouldConvertToBigInt("bytes32")).toBe(false);
  });

  it("handles array types correctly", () => {
    expect(shouldConvertToBigInt("uint256[]")).toBe(true);
    expect(shouldConvertToBigInt("uint32[]")).toBe(false);
    expect(shouldConvertToBigInt("string[]")).toBe(false);
  });
});

describe("convertValue", () => {
  describe("primitive types", () => {
    describe("BigInt types", () => {
      it("converts to BigInt for large integer types", () => {
        expect(convertValue("123456789012345678901234567890", "uint256")).toBe(
          BigInt("123456789012345678901234567890")
        );
        expect(convertValue(42, "uint128")).toBe(BigInt(42));
        expect(convertValue(BigInt(99), "int64")).toBe(BigInt(99));
      });

      it("throws error for invalid BigInt conversion", () => {
        expect(() => convertValue("invalid", "uint256")).toThrow(
          "Failed to convert invalid to BigInt"
        );
      });
    });

    describe("regular integers", () => {
      it("converts to Number for smaller integer types", () => {
        expect(convertValue("42", "uint32")).toBe(42);
        expect(convertValue(123, "int16")).toBe(123);
        expect(convertValue("0", "uint8")).toBe(0);
      });

      it("throws error for invalid number conversion", () => {
        expect(() => convertValue("not-a-number", "uint32")).toThrow(
          "Invalid number value: not-a-number for type uint32"
        );
      });

      it("throws error for negative value in unsigned type", () => {
        expect(() => convertValue(-5, "uint32")).toThrow(
          "Unsigned integer cannot be negative: -5 for type uint32"
        );
      });
    });

    describe("boolean type", () => {
      it("handles boolean values correctly", () => {
        expect(convertValue(true, "bool")).toBe(true);
        expect(convertValue(false, "bool")).toBe(false);
      });

      it("converts string booleans", () => {
        expect(convertValue("true", "bool")).toBe(true);
        expect(convertValue("false", "bool")).toBe(false);
        expect(convertValue("TRUE", "bool")).toBe(true);
        expect(convertValue("FALSE", "bool")).toBe(false);
        expect(convertValue("1", "bool")).toBe(true);
        expect(convertValue("0", "bool")).toBe(false);
      });

      it("converts number booleans", () => {
        expect(convertValue(1, "bool")).toBe(true);
        expect(convertValue(0, "bool")).toBe(false);
        expect(convertValue(42, "bool")).toBe(true);
        expect(convertValue(-1, "bool")).toBe(true);
      });

      it("throws error for invalid boolean strings", () => {
        expect(() => convertValue("maybe", "bool")).toThrow(
          "Invalid boolean value: maybe"
        );
      });
    });

    describe("string and address types", () => {
      it("converts to string", () => {
        expect(convertValue("hello", "string")).toBe("hello");
        expect(convertValue(123, "string")).toBe("123");
        expect(convertValue("0x1234567890abcdef", "address")).toBe("0x1234567890abcdef");
      });
    });

    describe("bytes types", () => {
      it("converts to string for bytes", () => {
        expect(convertValue("0xdeadbeef", "bytes")).toBe("0xdeadbeef");
        expect(convertValue("0x1234567890abcdef1234567890abcdef12345678", "bytes32")).toBe(
          "0x1234567890abcdef1234567890abcdef12345678"
        );
      });
    });

    describe("unknown types", () => {
      it("returns value as-is for unknown types", () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "test";
        
        expect(convertValue("test", "unknown")).toBe("test");
        expect(convertValue(42, "custom")).toBe(42);
        
        process.env.NODE_ENV = originalEnv;
      });
    });
  });

  describe("array types", () => {
    it("converts string arrays", () => {
      const input = ["hello", "world", 123];
      const result = convertValue(input, "string[]");
      expect(result).toEqual(["hello", "world", "123"]);
    });

    it("converts number arrays", () => {
      const input = ["1", "2", "3"];
      const result = convertValue(input, "uint32[]");
      expect(result).toEqual([1, 2, 3]);
    });

    it("converts BigInt arrays", () => {
      const input = ["123456789012345678901234567890", "987654321098765432109876543210"];
      const result = convertValue(input, "uint256[]");
      expect(result).toEqual([
        BigInt("123456789012345678901234567890"),
        BigInt("987654321098765432109876543210"),
      ]);
    });

    it("converts boolean arrays", () => {
      const input = [true, "false", 1, 0, "TRUE"];
      const result = convertValue(input, "bool[]");
      expect(result).toEqual([true, false, true, false, true]);
    });

    it("converts mixed type arrays to appropriate types", () => {
      const input = ["0x123", "0x456"];
      const result = convertValue(input, "address[]");
      expect(result).toEqual(["0x123", "0x456"]);
    });

    it("throws error when non-array is provided for array type", () => {
      expect(() => convertValue("not-an-array", "string[]")).toThrow(
        "Expected array for type string[], got string"
      );
      expect(() => convertValue(42, "uint256[]")).toThrow(
        "Expected array for type uint256[], got number"
      );
    });

    it("handles nested conversion errors in arrays", () => {
      const input = ["123", "invalid-number", "456"];
      expect(() => convertValue(input, "uint32[]")).toThrow(
        "Invalid number value: invalid-number for type uint32"
      );
    });

    it("handles empty arrays", () => {
      expect(convertValue([], "string[]")).toEqual([]);
      expect(convertValue([], "uint256[]")).toEqual([]);
      expect(convertValue([], "bool[]")).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("handles null and undefined values", () => {
      expect(convertValue(null, "string")).toBe("null");
      expect(convertValue(undefined, "string")).toBe("undefined");
    });

    it("handles zero values correctly", () => {
      expect(convertValue(0, "uint32")).toBe(0);
      expect(convertValue("0", "uint256")).toBe(BigInt(0));
      expect(convertValue(0, "bool")).toBe(false);
    });

    it("preserves object types for unknown Solidity types", () => {
      const obj = { key: "value" };
      expect(convertValue(obj, "struct")).toBe(obj);
    });
  });
});

describe("memoization", () => {
  beforeEach(() => {
    clearSignatureCache();
  });

  it("caches parsed signatures for performance", () => {
    const signature = "uint256 amount, string currency";
    
    // First call should parse and cache
    expect(getSignatureCacheSize()).toBe(0);
    const result1 = parseSignature(signature);
    expect(getSignatureCacheSize()).toBe(1);
    
    // Second call should return cached result
    const result2 = parseSignature(signature);
    expect(getSignatureCacheSize()).toBe(1);
    
    // Results should be identical
    expect(result1).toEqual(result2);
    expect(result1).toBe(result2); // Same reference
  });

  it("caches empty signatures", () => {
    const result1 = parseSignature("");
    const result2 = parseSignature("");
    
    expect(result1).toEqual([]);
    expect(result2).toEqual([]);
    expect(result1).toBe(result2); // Same reference
    expect(getSignatureCacheSize()).toBe(1);
  });

  it("handles different signatures independently", () => {
    const sig1 = "uint256 amount";
    const sig2 = "string name";
    
    parseSignature(sig1);
    parseSignature(sig2);
    
    expect(getSignatureCacheSize()).toBe(2);
    
    // Each should have its own cached result
    const result1a = parseSignature(sig1);
    const result1b = parseSignature(sig1);
    const result2a = parseSignature(sig2);
    
    expect(result1a).toBe(result1b);
    expect(result1a).not.toBe(result2a);
    expect(getSignatureCacheSize()).toBe(2);
  });

  it("clears cache when size limit is exceeded", () => {
    // Fill cache to near capacity
    for (let i = 0; i < 100; i++) {
      parseSignature(`uint256 param${i}`);
    }
    
    expect(getSignatureCacheSize()).toBe(100);
    
    // Adding one more should clear the cache
    parseSignature("uint256 overflow");
    
    // Cache should now contain only the new entry
    expect(getSignatureCacheSize()).toBe(1);
  });

  it("clearSignatureCache function works correctly", () => {
    parseSignature("uint256 amount");
    parseSignature("string name");
    
    expect(getSignatureCacheSize()).toBe(2);
    
    clearSignatureCache();
    
    expect(getSignatureCacheSize()).toBe(0);
  });
});

describe("integration tests", () => {
  beforeEach(() => {
    clearSignatureCache();
  });

  it("processes complete claim signature and data", () => {
    const signature = "uint256 amount, string currency, bool active, address[] wallets";
    const parameters = parseSignature(signature);
    
    expect(parameters).toEqual([
      { name: "amount", type: "uint256" },
      { name: "currency", type: "string" },
      { name: "active", type: "bool" },
      { name: "wallets", type: "address[]" },
    ]);

    const data = {
      amount: "1000000000000000000",
      currency: "USD",
      active: true,
      wallets: ["0x123", "0x456"],
    };

    const convertedData = parameters.map(param => ({
      name: param.name,
      value: convertValue(data[param.name as keyof typeof data], param.type),
    }));

    expect(convertedData).toEqual([
      { name: "amount", value: BigInt("1000000000000000000") },
      { name: "currency", value: "USD" },
      { name: "active", value: true },
      { name: "wallets", value: ["0x123", "0x456"] },
    ]);
  });

  it("handles complex nested arrays", () => {
    const signature = "uint256[] amounts, bool[] flags";
    const parameters = parseSignature(signature);
    
    const data = {
      amounts: ["100", "200", "300"],
      flags: ["true", "false", 1],
    };

    const convertedData = parameters.map(param => ({
      name: param.name,
      value: convertValue(data[param.name as keyof typeof data], param.type),
    }));

    expect(convertedData).toEqual([
      { name: "amounts", value: [BigInt(100), BigInt(200), BigInt(300)] },
      { name: "flags", value: [true, false, true] },
    ]);
  });
});