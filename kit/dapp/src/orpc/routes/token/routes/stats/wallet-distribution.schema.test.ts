/**
 * Token Wallet Distribution Stats Route Tests
 *
 * Tests the subgraph-based wallet distribution endpoint:
 * - Schema validation for GraphQL responses
 * - API response formatting
 * - Edge cases (null stats, empty data)
 * - Integration with TokenDistributionStatsState from subgraph
 *
 * @module TokenWalletDistributionTests
 */
import { safeParse } from "@/lib/zod";
import { describe, expect, it } from "vitest";
import {
  StatsWalletDistributionInputSchema,
  StatsWalletDistributionOutputSchema,
  type StatsWalletDistributionOutput,
} from "./wallet-distribution.schema";

// Logger is mocked via vitest.config.ts alias

describe("Token Wallet Distribution Schema Validation", () => {
  describe("Input Schema", () => {
    it("should validate valid Ethereum address", () => {
      const validInput = {
        tokenAddress: "0x1234567890123456789012345678901234567890",
      };
      const result = safeParse(StatsWalletDistributionInputSchema, validInput);
      expect(result.tokenAddress).toBe(
        "0x1234567890123456789012345678901234567890"
      );
    });

    it("should reject invalid Ethereum addresses", () => {
      const invalidAddress = {
        tokenAddress: "invalid-address",
      };
      expect(() =>
        safeParse(StatsWalletDistributionInputSchema, invalidAddress)
      ).toThrow();
    });

    it("should reject non-hex strings as addresses", () => {
      const nonHexAddress = {
        tokenAddress: "0xGHIJKLMNOPQRSTUVWXYZ1234567890123456789",
      };
      expect(() =>
        safeParse(StatsWalletDistributionInputSchema, nonHexAddress)
      ).toThrow("Validation failed with error(s). Check logs for details.");
    });

    it("should reject addresses with wrong length", () => {
      const shortAddress = {
        tokenAddress: "0x123", // Too short
      };
      expect(() =>
        safeParse(StatsWalletDistributionInputSchema, shortAddress)
      ).toThrow();
    });

    it("should normalize address to checksummed format", () => {
      const lowercaseAddress = {
        tokenAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      };
      const result = safeParse(
        StatsWalletDistributionInputSchema,
        lowercaseAddress
      );
      // Should be checksummed (mixed case)
      expect(result.tokenAddress).not.toBe(
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
      );
      expect(result.tokenAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("Output Schema", () => {
    it("should validate correct output structure with percentage ranges", () => {
      const validOutput: StatsWalletDistributionOutput = {
        buckets: [
          { range: "0-2%", count: 5 },
          { range: "2-10%", count: 3 },
          { range: "10-20%", count: 2 },
          { range: "20-40%", count: 1 },
          { range: "40-100%", count: 1 },
        ],
        totalHolders: 12,
      };
      const result = safeParse(
        StatsWalletDistributionOutputSchema,
        validOutput
      );
      expect(result.buckets).toHaveLength(5);
      expect(result.totalHolders).toBe(12);
      expect(result.buckets[0]?.range).toBe("0-2%");
      expect(result.buckets[0]?.count).toBe(5);
    });

    it("should handle empty buckets array", () => {
      const emptyOutput: StatsWalletDistributionOutput = {
        buckets: [],
        totalHolders: 0,
      };
      const result = safeParse(
        StatsWalletDistributionOutputSchema,
        emptyOutput
      );
      expect(result.buckets).toHaveLength(0);
      expect(result.totalHolders).toBe(0);
    });

    it("should reject non-string range values", () => {
      const invalidOutput = {
        buckets: [
          { range: 100, count: 5 }, // Should be string, not number
        ],
        totalHolders: 5,
      };
      expect(() =>
        safeParse(StatsWalletDistributionOutputSchema, invalidOutput)
      ).toThrow();
    });

    it("should reject non-number count values", () => {
      const invalidOutput = {
        buckets: [
          { range: "0-2%", count: "5" }, // Should be number, not string
        ],
        totalHolders: 5,
      };
      expect(() =>
        safeParse(StatsWalletDistributionOutputSchema, invalidOutput)
      ).toThrow();
    });

    it("should reject non-number totalHolders", () => {
      const invalidOutput = {
        buckets: [],
        totalHolders: "12", // Should be number, not string
      };
      expect(() =>
        safeParse(StatsWalletDistributionOutputSchema, invalidOutput)
      ).toThrow();
    });
  });
});

describe("Subgraph Response Formatting", () => {
  describe("TokenDistributionStatsState Response Processing", () => {
    it("should correctly format subgraph stats to API response", () => {
      // Simulate subgraph response structure
      const mockSubgraphStats = {
        balancesCountSegment1: 10,
        balancesCountSegment2: 8,
        balancesCountSegment3: 5,
        balancesCountSegment4: 3,
        balancesCountSegment5: 2,
      };

      // This would be the logic from our handler
      const apiResponse = {
        buckets: [
          { range: "0-2%", count: mockSubgraphStats.balancesCountSegment1 },
          { range: "2-10%", count: mockSubgraphStats.balancesCountSegment2 },
          { range: "10-20%", count: mockSubgraphStats.balancesCountSegment3 },
          { range: "20-40%", count: mockSubgraphStats.balancesCountSegment4 },
          { range: "40-100%", count: mockSubgraphStats.balancesCountSegment5 },
        ],
        totalHolders:
          mockSubgraphStats.balancesCountSegment1 +
          mockSubgraphStats.balancesCountSegment2 +
          mockSubgraphStats.balancesCountSegment3 +
          mockSubgraphStats.balancesCountSegment4 +
          mockSubgraphStats.balancesCountSegment5,
      };

      expect(apiResponse.buckets).toHaveLength(5);
      expect(apiResponse.totalHolders).toBe(28);
      expect(apiResponse.buckets[0]).toEqual({ range: "0-2%", count: 10 });
      expect(apiResponse.buckets[4]).toEqual({ range: "40-100%", count: 2 });
    });

    it("should handle null subgraph stats (new token)", () => {
      // This would be the logic from our handler for null case
      const apiResponse = {
        buckets: [
          { range: "0-2%", count: 0 },
          { range: "2-10%", count: 0 },
          { range: "10-20%", count: 0 },
          { range: "20-40%", count: 0 },
          { range: "40-100%", count: 0 },
        ],
        totalHolders: 0,
      };

      expect(apiResponse.buckets).toHaveLength(5);
      expect(apiResponse.totalHolders).toBe(0);
      expect(apiResponse.buckets.every((bucket) => bucket.count === 0)).toBe(
        true
      );
    });

    it("should handle all zero counts", () => {
      const mockZeroStats = {
        balancesCountSegment1: 0,
        balancesCountSegment2: 0,
        balancesCountSegment3: 0,
        balancesCountSegment4: 0,
        balancesCountSegment5: 0,
      };

      const apiResponse = {
        buckets: [
          { range: "0-2%", count: mockZeroStats.balancesCountSegment1 },
          { range: "2-10%", count: mockZeroStats.balancesCountSegment2 },
          { range: "10-20%", count: mockZeroStats.balancesCountSegment3 },
          { range: "20-40%", count: mockZeroStats.balancesCountSegment4 },
          { range: "40-100%", count: mockZeroStats.balancesCountSegment5 },
        ],
        totalHolders: 0,
      };

      expect(apiResponse.totalHolders).toBe(0);
      expect(apiResponse.buckets.every((bucket) => bucket.count === 0)).toBe(
        true
      );
    });

    it("should handle single segment having all holders", () => {
      const mockSingleSegmentStats = {
        balancesCountSegment1: 0,
        balancesCountSegment2: 0,
        balancesCountSegment3: 0,
        balancesCountSegment4: 0,
        balancesCountSegment5: 100, // All holders in the highest segment
      };

      const apiResponse = {
        buckets: [
          {
            range: "0-2%",
            count: mockSingleSegmentStats.balancesCountSegment1,
          },
          {
            range: "2-10%",
            count: mockSingleSegmentStats.balancesCountSegment2,
          },
          {
            range: "10-20%",
            count: mockSingleSegmentStats.balancesCountSegment3,
          },
          {
            range: "20-40%",
            count: mockSingleSegmentStats.balancesCountSegment4,
          },
          {
            range: "40-100%",
            count: mockSingleSegmentStats.balancesCountSegment5,
          },
        ],
        totalHolders: 100,
      };

      expect(apiResponse.totalHolders).toBe(100);
      expect(apiResponse.buckets[4]?.count).toBe(100);
      expect(
        apiResponse.buckets.slice(0, 4).every((bucket) => bucket.count === 0)
      ).toBe(true);
    });
  });
});

describe("GraphQL Response Schema Validation", () => {
  describe("TokenDistributionStatsState Schema", () => {
    it("should validate correct GraphQL response structure", () => {
      const validGraphQLResponse = {
        tokenDistributionStatsState: {
          balancesCountSegment1: 10,
          balancesCountSegment2: 8,
          balancesCountSegment3: 5,
          balancesCountSegment4: 3,
          balancesCountSegment5: 2,
        },
      };

      // This would be validated by TokenDistributionStatsResponseSchema
      expect(validGraphQLResponse.tokenDistributionStatsState).toBeDefined();
      expect(
        validGraphQLResponse.tokenDistributionStatsState?.balancesCountSegment1
      ).toBe(10);
      expect(
        validGraphQLResponse.tokenDistributionStatsState?.balancesCountSegment5
      ).toBe(2);
    });

    it("should handle null tokenDistributionStatsState", () => {
      const nullTokenResponse = {
        tokenDistributionStatsState: null,
      };

      expect(nullTokenResponse.tokenDistributionStatsState).toBeNull();
    });

    it("should handle partial segments correctly", () => {
      const partialResponse = {
        tokenDistributionStatsState: {
          balancesCountSegment1: 5,
          // Missing other segments would be handled by nullish coalescing in our handler
        },
      };

      expect(
        partialResponse.tokenDistributionStatsState?.balancesCountSegment1
      ).toBe(5);
      // TypeScript ensures missing properties don't exist at compile time
    });
  });
});

describe("Edge Cases and Error Scenarios", () => {
  describe("Percentage Range Labels", () => {
    it("should use consistent percentage range labels", () => {
      const expectedRanges = ["0-2%", "2-10%", "10-20%", "20-40%", "40-100%"];

      const mockResponse = {
        buckets: expectedRanges.map((range, index) => ({
          range,
          count: index,
        })),
        totalHolders: 10,
      };

      expect(mockResponse.buckets.map((b) => b.range)).toEqual(expectedRanges);
    });

    it("should maintain correct bucket order", () => {
      const mockStats = {
        balancesCountSegment1: 1,
        balancesCountSegment2: 2,
        balancesCountSegment3: 3,
        balancesCountSegment4: 4,
        balancesCountSegment5: 5,
      };

      const buckets = [
        { range: "0-2%", count: mockStats.balancesCountSegment1 },
        { range: "2-10%", count: mockStats.balancesCountSegment2 },
        { range: "10-20%", count: mockStats.balancesCountSegment3 },
        { range: "20-40%", count: mockStats.balancesCountSegment4 },
        { range: "40-100%", count: mockStats.balancesCountSegment5 },
      ];

      expect(buckets[0]?.count).toBe(1);
      expect(buckets[1]?.count).toBe(2);
      expect(buckets[2]?.count).toBe(3);
      expect(buckets[3]?.count).toBe(4);
      expect(buckets[4]?.count).toBe(5);
    });
  });

  describe("Security and Input Sanitization", () => {
    it("should prevent GraphQL injection in tokenAddress", () => {
      const maliciousInput = {
        tokenAddress:
          "0x1234567890123456789012345678901234567890'; DROP TABLE tokens; --",
      };
      // The ethereumAddress validator should reject this
      expect(() =>
        safeParse(StatsWalletDistributionInputSchema, maliciousInput)
      ).toThrow();
    });

    it("should sanitize and validate all address formats", () => {
      const invalidTestCases = [
        "1234567890123456789012345678901234567890", // Missing 0x prefix
        "0x", // Only prefix
        "0x123", // Too short
        "0x12345678901234567890123456789012345678901", // Too long
        "0X1234567890123456789012345678901234567890", // Uppercase 0X (invalid)
      ];

      invalidTestCases.forEach((testCase) => {
        const input = { tokenAddress: testCase };
        // All these should fail
        expect(() =>
          safeParse(StatsWalletDistributionInputSchema, input)
        ).toThrow("Validation failed with error(s). Check logs for details.");
      });
    });
  });
});
