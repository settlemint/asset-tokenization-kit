import { from } from "dnum";
import { describe, expect, it } from "vitest";
import {
  getTokenYield,
  isTokenYield,
  tokenFixedYieldSchedule,
  tokenFixedYieldSchedulePeriod,
  tokenYield,
  type TokenFixedYieldSchedule,
  type TokenFixedYieldSchedulePeriod,
  type TokenYield,
} from "./token-yield";

describe("tokenFixedYieldSchedulePeriod", () => {
  const validator = tokenFixedYieldSchedulePeriod();

  describe("valid period data", () => {
    it("should accept valid period object", () => {
      const validPeriod = {
        id: "0x1234567890abcdef",
        startDate: "1680354000",
        endDate: "1683032400",
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      const result = validator.parse(validPeriod);
      expect(result).toBeDefined();
      expect(result.id).toBe(validPeriod.id);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.totalClaimed).toEqual(from("1000.0"));
      expect(result.totalUnclaimedYield).toEqual(from("500.0"));
      expect(result.totalYield).toEqual(from("1500.0"));
      expect(result.deployedInTransaction).toBe(
        validPeriod.deployedInTransaction
      );
    });

    it("should accept Date objects for timestamps", () => {
      const validPeriod = {
        id: "0xabcdef",
        startDate: new Date("2023-04-01T00:00:00Z"),
        endDate: new Date("2023-05-01T00:00:00Z"),
        totalClaimed: "0",
        totalUnclaimedYield: "0",
        totalYield: "0",
        deployedInTransaction:
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = validator.parse(validPeriod);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it("should accept numeric values for amounts", () => {
      const validPeriod = {
        id: "0x123456",
        startDate: "1680354000",
        endDate: "1683032400",
        totalClaimed: 1000,
        totalUnclaimedYield: 500.5,
        totalYield: 1500.5,
        deployedInTransaction:
          "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      };

      const result = validator.parse(validPeriod);
      expect(result.totalClaimed).toBeDefined();
      expect(result.totalUnclaimedYield).toBeDefined();
      expect(result.totalYield).toBeDefined();
    });
  });

  describe("invalid period data", () => {
    it("should reject invalid ethereum hex id", () => {
      const invalidPeriod = {
        id: "not-a-hex",
        startDate: "1680354000",
        endDate: "1683032400",
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      expect(() => validator.parse(invalidPeriod)).toThrow();
    });

    it("should reject invalid transaction hash", () => {
      const invalidPeriod = {
        id: "0x123456",
        startDate: "1680354000",
        endDate: "1683032400",
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        deployedInTransaction: "invalid-hash",
      };

      expect(() => validator.parse(invalidPeriod)).toThrow();
    });

    it("should reject invalid timestamps", () => {
      const invalidPeriod = {
        id: "0x123456",
        startDate: "not-a-timestamp",
        endDate: "1683032400",
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      expect(() => validator.parse(invalidPeriod)).toThrow();
    });

    it("should reject invalid decimal values", () => {
      const invalidPeriod = {
        id: "0x123456",
        startDate: "1680354000",
        endDate: "1683032400",
        totalClaimed: "invalid-number",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      expect(() => validator.parse(invalidPeriod)).toThrow();
    });

    it("should reject missing required fields", () => {
      const invalidPeriod = {
        id: "0x123456",
        startDate: "1680354000",
        // missing endDate
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      expect(() => validator.parse(invalidPeriod)).toThrow();
    });
  });

  describe("type checking", () => {
    it("should infer correct types", () => {
      const validPeriod = {
        id: "0x123456",
        startDate: "1680354000",
        endDate: "1683032400",
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };

      const result: TokenFixedYieldSchedulePeriod =
        validator.parse(validPeriod);
      expect(result.id).toBe(validPeriod.id);
    });
  });
});

describe("tokenFixedYieldSchedule", () => {
  const validator = tokenFixedYieldSchedule();

  const createValidSchedule = () => ({
    id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    createdAt: "1680354000",
    createdBy: {
      id: "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
      isContract: false,
    },
    account: {
      id: "0x0000000000000000000000000000000000000001",
      isContract: true,
    },
    token: {
      id: "0xa0b86991c31c4f0d10325bd662dd74d6cd2e8d9a",
    },
    startDate: "1680354000",
    endDate: "1711890000",
    rate: "500",
    interval: "2592000",
    totalClaimed: "1000.0",
    totalUnclaimedYield: "500.0",
    totalYield: "1500.0",
    denominationAsset: {
      id: "0x6b175474e89094c44da98b954eedeac495271d0f",
      symbol: "USDC",
      decimals: 6,
    },
    currentPeriod: null as TokenFixedYieldSchedulePeriod | null,
    nextPeriod: null as TokenFixedYieldSchedulePeriod | null,
    periods: [] as TokenFixedYieldSchedulePeriod[],
    deployedInTransaction:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  });

  describe("valid schedule data", () => {
    it("should accept valid schedule object", () => {
      const validSchedule = createValidSchedule();
      const result = validator.parse(validSchedule);

      expect(result).toBeDefined();
      expect(result.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // checksummed version
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdBy.id).toBe(
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"
      ); // checksummed
      expect(result.createdBy.isContract).toBe(false);
      expect(result.account.id).toBe(
        "0x0000000000000000000000000000000000000001"
      );
      expect(result.account.isContract).toBe(true);
      expect(result.token.id).toBe(
        "0xA0B86991c31c4F0d10325bd662Dd74d6Cd2e8D9a"
      ); // checksummed
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.rate).toBe("500");
      expect(result.interval).toBe("2592000");
      expect(result.totalClaimed).toEqual(from("1000.0"));
      expect(result.totalUnclaimedYield).toEqual(from("500.0"));
      expect(result.totalYield).toEqual(from("1500.0"));
      expect(result.denominationAsset.id).toBe(
        "0x6B175474E89094C44Da98b954EedeAC495271d0F" // checksummed
      );
      expect(result.denominationAsset.symbol).toBe("USDC");
      expect(result.denominationAsset.decimals).toBe(6);
      expect(result.currentPeriod).toBeNull();
      expect(result.nextPeriod).toBeNull();
      expect(result.periods).toEqual([]);
      expect(result.deployedInTransaction).toBe(
        validSchedule.deployedInTransaction
      );
    });

    it("should accept schedule with periods", () => {
      const validSchedule = createValidSchedule();
      const period = {
        id: "0x1234567890abcdef" as const,
        startDate: new Date("2023-04-01T00:00:00Z"),
        endDate: new Date("2023-05-01T00:00:00Z"),
        totalClaimed: from("100.0"),
        totalUnclaimedYield: from("50.0"),
        totalYield: from("150.0"),
        deployedInTransaction:
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as const,
      };

      validSchedule.currentPeriod = period;
      validSchedule.nextPeriod = { ...period, id: "0xfedcba0987654321" };
      validSchedule.periods = [period, { ...period, id: "0xfedcba0987654321" }];

      const result = validator.parse(validSchedule);

      expect(result.currentPeriod).toBeDefined();
      expect(result.currentPeriod?.id).toBe("0x1234567890abcdef");
      expect(result.nextPeriod).toBeDefined();
      expect(result.nextPeriod?.id).toBe("0xfedcba0987654321");
      expect(result.periods).toHaveLength(2);
    });

    it("should accept Date objects for timestamps", () => {
      const validSchedule = createValidSchedule();
      validSchedule.createdAt = new Date("2023-04-01T00:00:00Z")
        .getTime()
        .toString();
      validSchedule.startDate = new Date("2023-04-01T00:00:00Z")
        .getTime()
        .toString();
      validSchedule.endDate = new Date("2024-04-01T00:00:00Z")
        .getTime()
        .toString();

      const result = validator.parse(validSchedule);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });

  describe("invalid schedule data", () => {
    it("should reject invalid ethereum address for id", () => {
      const invalidSchedule = createValidSchedule();
      invalidSchedule.id = "not-an-address";

      expect(() => validator.parse(invalidSchedule)).toThrow();
    });

    it("should reject invalid createdBy structure", () => {
      const invalidSchedule = createValidSchedule();
      invalidSchedule.createdBy = {
        id: "invalid-address",
        isContract: false,
      };

      expect(() => validator.parse(invalidSchedule)).toThrow();
    });

    it("should reject invalid denomination asset", () => {
      const invalidSchedule = createValidSchedule();
      invalidSchedule.denominationAsset = {
        id: "invalid-address",
        symbol: "USDC",
        decimals: 6,
      };

      expect(() => validator.parse(invalidSchedule)).toThrow();
    });

    it("should reject invalid decimals", () => {
      const invalidSchedule = createValidSchedule();
      invalidSchedule.denominationAsset.decimals =
        "not-a-number" as unknown as number;

      expect(() => validator.parse(invalidSchedule)).toThrow();
    });

    it("should reject invalid periods array", () => {
      const invalidSchedule = createValidSchedule();
      invalidSchedule.periods = [
        {
          id: "invalid-hex" as unknown as `0x${string}`,
          startDate: new Date("2023-04-01T00:00:00Z"),
          endDate: new Date("2023-05-01T00:00:00Z"),
          totalClaimed: from("100.0"),
          totalUnclaimedYield: from("50.0"),
          totalYield: from("150.0"),
          deployedInTransaction:
            "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as const,
        },
      ];

      expect(() => validator.parse(invalidSchedule)).toThrow();
    });

    it("should reject missing required fields", () => {
      const invalidSchedule = {
        id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        createdAt: "1680354000",
        // missing other required fields
      };

      expect(() => validator.parse(invalidSchedule)).toThrow();
    });
  });

  describe("type checking", () => {
    it("should infer correct types", () => {
      const validSchedule = createValidSchedule();
      const result: TokenFixedYieldSchedule = validator.parse(validSchedule);
      expect(result.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // checksummed version
    });
  });
});

describe("tokenYield", () => {
  const validator = tokenYield();

  const createValidYield = () => ({
    id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    schedule: {
      id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      createdAt: "1680354000",
      createdBy: {
        id: "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
        isContract: false,
      },
      account: {
        id: "0x0000000000000000000000000000000000000001",
        isContract: true,
      },
      token: {
        id: "0xa0b86991c31c4f0d10325bd662dd74d6cd2e8d9a",
      },
      startDate: "1680354000",
      endDate: "1711890000",
      rate: "500",
      interval: "2592000",
      totalClaimed: "1000.0",
      totalUnclaimedYield: "500.0",
      totalYield: "1500.0",
      denominationAsset: {
        id: "0x6b175474e89094c44da98b954eedeac495271d0f",
        symbol: "USDC",
        decimals: 6,
      },
      currentPeriod: null,
      nextPeriod: null,
      periods: [],
      deployedInTransaction:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
  });

  describe("valid yield data", () => {
    it("should accept valid yield object with schedule", () => {
      const validYield = createValidYield();
      const result = validator.parse(validYield);

      expect(result).toBeDefined();
      expect(result.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // checksummed version
      expect(result.schedule).toBeDefined();
      expect(result.schedule?.id).toBe(
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ); // checksummed
    });

    it("should accept yield with null schedule", () => {
      const validYield = {
        id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        schedule: null,
      };

      const result = validator.parse(validYield);
      expect(result.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // checksummed version
      expect(result.schedule).toBeNull();
    });
  });

  describe("invalid yield data", () => {
    it("should reject invalid ethereum address for id", () => {
      const invalidYield = createValidYield();
      invalidYield.id = "not-an-address";

      expect(() => validator.parse(invalidYield)).toThrow();
    });

    it("should reject invalid schedule", () => {
      const invalidYield = createValidYield();
      invalidYield.schedule.id = "invalid-address";

      expect(() => validator.parse(invalidYield)).toThrow();
    });

    it("should reject missing id field", () => {
      const invalidYield = {
        schedule: null,
      };

      expect(() => validator.parse(invalidYield)).toThrow();
    });

    it("should reject wrong type for schedule", () => {
      const invalidYield = {
        id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
        schedule: "invalid-schedule",
      };

      expect(() => validator.parse(invalidYield)).toThrow();
    });
  });

  describe("type checking", () => {
    it("should infer correct types", () => {
      const validYield = createValidYield();
      const result: TokenYield = validator.parse(validYield);
      expect(result.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // checksummed version
    });

    it("should handle safeParse", () => {
      const validYield = createValidYield();
      const result = validator.safeParse(validYield);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(
          "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        ); // checksummed
      }
    });
  });
});

describe("isTokenYield", () => {
  const createValidYield = () => ({
    id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    schedule: null,
  });

  it("should return true for valid token yield", () => {
    const validYield = createValidYield();
    expect(isTokenYield(validYield)).toBe(true);
  });

  it("should return true for yield with full schedule", () => {
    const validYield = {
      id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      schedule: {
        id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        createdAt: "1680354000",
        createdBy: {
          id: "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
          isContract: false,
        },
        account: {
          id: "0x0000000000000000000000000000000000000001",
          isContract: true,
        },
        token: {
          id: "0xa0b86991c31c4f0d10325bd662dd74d6cd2e8d9a",
        },
        startDate: "1680354000",
        endDate: "1711890000",
        rate: "500",
        interval: "2592000",
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        denominationAsset: {
          id: "0x6b175474e89094c44da98b954eedeac495271d0f",
          symbol: "USDC",
          decimals: 6,
        },
        currentPeriod: null,
        nextPeriod: null,
        periods: [],
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    };

    expect(isTokenYield(validYield)).toBe(true);
  });

  it("should return false for invalid token yield", () => {
    expect(isTokenYield(null)).toBe(false);
    expect(isTokenYield(undefined)).toBe(false);
    expect(isTokenYield({})).toBe(false);
    expect(isTokenYield({ id: "invalid-address", schedule: null })).toBe(false);
    expect(isTokenYield({ schedule: null })).toBe(false);
    expect(isTokenYield("not-an-object")).toBe(false);
    expect(isTokenYield(123)).toBe(false);
    expect(isTokenYield([])).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = {
      id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      schedule: null,
    };

    if (isTokenYield(value)) {
      // TypeScript should recognize value as TokenYield
      const parsedYield = getTokenYield(value);
      expect(parsedYield.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // checksummed
    }
  });
});

describe("getTokenYield", () => {
  const createValidYield = () => ({
    id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    schedule: null,
  });

  it("should return parsed token yield for valid data", () => {
    const validYield = createValidYield();
    const result = getTokenYield(validYield);

    expect(result).toBeDefined();
    expect(result.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F"); // checksummed version
    expect(result.schedule).toBeNull();
  });

  it("should throw for invalid token yield", () => {
    expect(() => getTokenYield(null)).toThrow();
    expect(() => getTokenYield(undefined)).toThrow();
    expect(() => getTokenYield({})).toThrow();
    expect(() =>
      getTokenYield({ id: "invalid-address", schedule: null })
    ).toThrow();
    expect(() => getTokenYield({ schedule: null })).toThrow();
    expect(() => getTokenYield("not-an-object")).toThrow();
  });

  it("should be useful in functions requiring TokenYield type", () => {
    const processYield = (data: unknown): string => {
      const yield_ = getTokenYield(data);
      return yield_.schedule?.rate || "No rate defined";
    };

    const validData = {
      id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      schedule: {
        id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        createdAt: "1680354000",
        createdBy: {
          id: "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
          isContract: false,
        },
        account: {
          id: "0x0000000000000000000000000000000000000001",
          isContract: true,
        },
        token: {
          id: "0xa0b86991c31c4f0d10325bd662dd74d6cd2e8d9a",
        },
        startDate: "1680354000",
        endDate: "1711890000",
        rate: "500",
        interval: "2592000",
        totalClaimed: "1000.0",
        totalUnclaimedYield: "500.0",
        totalYield: "1500.0",
        denominationAsset: {
          id: "0x6b175474e89094c44da98b954eedeac495271d0f",
          symbol: "USDC",
          decimals: 6,
        },
        currentPeriod: null,
        nextPeriod: null,
        periods: [],
        deployedInTransaction:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
    };

    const rate = processYield(validData);
    expect(rate).toBe("500");
  });
});
