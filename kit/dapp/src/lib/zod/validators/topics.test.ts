import { describe, expect, it, beforeEach } from "vitest";
import {
  atkTopic,
  atkTopics,
  ATKTopicEnum,
  getTopicId,
  getTopicNameFromId,
  type ATKTopic,
} from "./topics";

describe("atkTopic", () => {
  const validator = atkTopic();

  describe("valid inputs", () => {
    it.each(atkTopics)("should accept topic '%s'", (topic) => {
      expect(validator.parse(topic)).toBe(topic);
    });

    it("should accept ATKTopicEnum.kyc", () => {
      expect(validator.parse(ATKTopicEnum.kyc)).toBe("kyc");
    });

    it("should accept ATKTopicEnum.aml", () => {
      expect(validator.parse(ATKTopicEnum.aml)).toBe("aml");
    });

    it("should accept ATKTopicEnum.collateral", () => {
      expect(validator.parse(ATKTopicEnum.collateral)).toBe("collateral");
    });

    it("should accept ATKTopicEnum.isin", () => {
      expect(validator.parse(ATKTopicEnum.isin)).toBe("isin");
    });

    it("should accept ATKTopicEnum.assetClassification", () => {
      expect(validator.parse(ATKTopicEnum.assetClassification)).toBe(
        "assetClassification"
      );
    });

    it("should accept ATKTopicEnum.basePrice", () => {
      expect(validator.parse(ATKTopicEnum.basePrice)).toBe("basePrice");
    });
  });

  describe("invalid inputs", () => {
    it("should reject invalid topic strings", () => {
      expect(() => validator.parse("invalid")).toThrow();
      expect(() => validator.parse("KYC")).toThrow(); // Case sensitive
      expect(() => validator.parse("")).toThrow();
      expect(() => validator.parse("unknown-topic")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse(123)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
      expect(() => validator.parse(true)).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid topics", () => {
      const result = validator.safeParse("kyc");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("kyc");
      }
    });

    it("should return error for invalid topics", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

describe("ATKTopicEnum", () => {
  it("should have correct constant values", () => {
    expect(ATKTopicEnum.kyc).toBe("kyc");
    expect(ATKTopicEnum.aml).toBe("aml");
    expect(ATKTopicEnum.collateral).toBe("collateral");
    expect(ATKTopicEnum.isin).toBe("isin");
    expect(ATKTopicEnum.assetClassification).toBe("assetClassification");
    expect(ATKTopicEnum.basePrice).toBe("basePrice");
  });

  it("should contain all values from atkTopics", () => {
    const enumValues = Object.values(ATKTopicEnum);
    expect(enumValues).toEqual(expect.arrayContaining([...atkTopics]));
    expect(enumValues.length).toBe(atkTopics.length);
  });
});

describe("atkTopics", () => {
  it("should contain all expected topics", () => {
    expect(atkTopics).toEqual([
      "kyc",
      "aml",
      "collateral",
      "isin",
      "assetClassification",
      "basePrice",
    ]);
  });

  it("should have consistent length and structure", () => {
    expect(atkTopics.length).toBe(6);
    expect(Array.isArray(atkTopics)).toBe(true);
    expect(atkTopics.every((topic) => typeof topic === "string")).toBe(true);
  });
});

describe("getTopicId", () => {
  it("should generate consistent IDs for the same topic", () => {
    const id1 = getTopicId(ATKTopicEnum.kyc);
    const id2 = getTopicId(ATKTopicEnum.kyc);
    expect(id1).toBe(id2);
    expect(typeof id1).toBe("bigint");
  });

  it("should generate different IDs for different topics", () => {
    const kycId = getTopicId(ATKTopicEnum.kyc);
    const amlId = getTopicId(ATKTopicEnum.aml);
    const collateralId = getTopicId(ATKTopicEnum.collateral);

    expect(kycId).not.toBe(amlId);
    expect(kycId).not.toBe(collateralId);
    expect(amlId).not.toBe(collateralId);
  });

  it("should generate positive IDs", () => {
    atkTopics.forEach((topic) => {
      const id = getTopicId(topic);
      expect(id > 0n).toBe(true);
    });
  });

  it("should use cache on subsequent calls", () => {
    // Clear any existing cache by creating a new topic ID
    const id1 = getTopicId(ATKTopicEnum.kyc);

    // This should use cache
    const start = performance.now();
    const id2 = getTopicId(ATKTopicEnum.kyc);
    const end = performance.now();

    expect(id1).toBe(id2);
    // Cached call should be very fast (less than 1ms in most cases)
    expect(end - start).toBeLessThan(10);
  });

  it.each(atkTopics)("should generate ID for topic '%s'", (topic) => {
    const id = getTopicId(topic);
    expect(typeof id).toBe("bigint");
    expect(id > 0n).toBe(true);
  });
});

describe("getTopicNameFromId", () => {
  let topicIds: Map<ATKTopic, bigint>;

  beforeEach(() => {
    // Generate IDs for all topics
    topicIds = new Map();
    atkTopics.forEach((topic) => {
      topicIds.set(topic, getTopicId(topic));
    });
  });

  it("should return correct topic name for known IDs", () => {
    topicIds.forEach((id, expectedTopic) => {
      const topic = getTopicNameFromId(id);
      expect(topic).toBe(expectedTopic);
    });
  });

  it("should handle cache correctly", () => {
    const kycId = getTopicId(ATKTopicEnum.kyc);

    // First call should work
    const topic1 = getTopicNameFromId(kycId);
    expect(topic1).toBe(ATKTopicEnum.kyc);

    // Second call should use cache
    const start = performance.now();
    const topic2 = getTopicNameFromId(kycId);
    const end = performance.now();

    expect(topic2).toBe(ATKTopicEnum.kyc);
    expect(end - start).toBeLessThan(10);
  });

  it("should throw error for unknown IDs", () => {
    const unknownId = 999_999_999_999_999_999n;
    expect(() => getTopicNameFromId(unknownId)).toThrow(
      `Topic name for ID ${unknownId} not found`
    );
  });

  it("should be inverse of getTopicId", () => {
    atkTopics.forEach((originalTopic) => {
      const id = getTopicId(originalTopic);
      const retrievedTopic = getTopicNameFromId(id);
      expect(retrievedTopic).toBe(originalTopic);
    });
  });

  it("should handle all ATKTopicEnum values", () => {
    Object.values(ATKTopicEnum).forEach((topic) => {
      const id = getTopicId(topic);
      const retrievedTopic = getTopicNameFromId(id);
      expect(retrievedTopic).toBe(topic);
    });
  });
});

describe("topic ID generation consistency", () => {
  it("should generate same IDs across multiple calls", () => {
    const iterations = 10;
    const baselineIds = new Map<ATKTopic, bigint>();

    // Generate baseline IDs
    atkTopics.forEach((topic) => {
      baselineIds.set(topic, getTopicId(topic));
    });

    // Test consistency across multiple iterations
    for (let i = 0; i < iterations; i++) {
      atkTopics.forEach((topic) => {
        const currentId = getTopicId(topic);
        const baselineId = baselineIds.get(topic);
        expect(currentId).toBe(baselineId);
      });
    }
  });

  it("should maintain bidirectional consistency", () => {
    // Test that getTopicId -> getTopicNameFromId -> getTopicId produces same result
    atkTopics.forEach((originalTopic) => {
      const id1 = getTopicId(originalTopic);
      const retrievedTopic = getTopicNameFromId(id1);
      const id2 = getTopicId(retrievedTopic);

      expect(id1).toBe(id2);
      expect(retrievedTopic).toBe(originalTopic);
    });
  });
});
