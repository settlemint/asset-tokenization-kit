/**
 * @vitest-environment node
 *
 * Actions Schema Tests
 *
 * Unit tests for actions schemas and validation.
 * Tests all input/output schemas for actions-related operations.
 * @module ActionsTests
 */
import { describe, expect, it } from "vitest";
import {
  ActionExecutorSchema,
  ActionSchema,
  ActionStatusSchema,
  ActionsListDataSchema,
  ActionsListResponseSchema,
  ActionsListSchema,
} from "./routes/actions.list.schema";

// Logger is mocked via vitest.config.ts alias

describe("Actions Schemas", () => {
  describe("ActionStatusSchema", () => {
    it("should validate all status enum values", () => {
      const validStatuses = [
        "PENDING",
        "ACTIVE",
        "EXECUTED",
        "EXPIRED",
      ] as const;

      for (const status of validStatuses) {
        const result = ActionStatusSchema.parse(status);
        expect(result).toBe(status);
      }
    });

    it("should reject invalid status values", () => {
      const invalidStatuses = ["UNKNOWN", "pending", "active", "", "COMPLETED"];

      for (const status of invalidStatuses) {
        expect(() => ActionStatusSchema.parse(status)).toThrow();
      }
    });
  });

  describe("ActionExecutorSchema", () => {
    it("should validate executor with valid addresses", () => {
      const validExecutor = {
        id: "executor-1",
        executors: [
          "0x1234567890123456789012345678901234567890",
          "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        ],
      };
      const result = ActionExecutorSchema.parse(validExecutor);
      expect(result.id).toBe("executor-1");
      expect(result.executors).toHaveLength(2);
    });

    it("should reject executor with invalid addresses", () => {
      const invalidExecutor = {
        id: "executor-1",
        executors: ["invalid-address", "0x123"], // Invalid Ethereum addresses
      };
      expect(() => ActionExecutorSchema.parse(invalidExecutor)).toThrow();
    });

    it("should require id field", () => {
      const missingId = {
        executors: ["0x1234567890123456789012345678901234567890"],
      };
      expect(() => ActionExecutorSchema.parse(missingId)).toThrow();
    });

    it("should require executors array", () => {
      const missingExecutors = {
        id: "executor-1",
      };
      expect(() => ActionExecutorSchema.parse(missingExecutors)).toThrow();
    });

    it("should allow empty executors array", () => {
      const emptyExecutors = {
        id: "executor-1",
        executors: [],
      };
      const result = ActionExecutorSchema.parse(emptyExecutors);
      expect(result.executors).toHaveLength(0);
    });
  });

  describe("ActionSchema", () => {
    const validAction = {
      id: "action-123",
      name: "Test Action",
      target: "0x1234567890123456789012345678901234567890",
      activeAt: 1_700_000_100n,
      status: "ACTIVE" as const,
      executedAt: null,
      executedBy: null,
      executor: {
        id: "executor-1",
        executors: ["0x1234567890123456789012345678901234567890"],
      },
    };

    it("should validate complete action object", () => {
      const result = ActionSchema.parse(validAction);
      expect(result.id).toBe("action-123");
      expect(result.name).toBe("Test Action");
      expect(result.status).toBe("ACTIVE");
      expect(result.activeAt).toBe(1_700_000_100n);
    });

    it("should handle null optional fields", () => {
      const actionWithNulls = {
        ...validAction,
        executedAt: null,
        executedBy: null,
      };
      const result = ActionSchema.parse(actionWithNulls);
      expect(result.executedAt).toBeNull();
      expect(result.executedBy).toBeNull();
    });

    it("should require all mandatory fields", () => {
      const requiredFields = [
        "id",
        "name",
        "target",
        "activeAt",
        "status",
        "executor",
      ];

      requiredFields.forEach((field) => {
        const incompleteAction = Object.fromEntries(
          Object.entries(validAction).filter(([key]) => key !== field)
        );
        expect(() => ActionSchema.parse(incompleteAction)).toThrow();
      });
    });

    it("should validate target as Ethereum address", () => {
      const invalidTarget = {
        ...validAction,
        target: "invalid-address",
      };
      expect(() => ActionSchema.parse(invalidTarget)).toThrow();
    });

    it("should validate executedBy as Ethereum address when present", () => {
      const validExecutedBy = {
        ...validAction,
        executedBy: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      };
      const result = ActionSchema.parse(validExecutedBy);
      // The ethereum address validator normalizes to checksum format
      expect(result.executedBy).toBe(
        "0xABcdEFABcdEFabcdEfAbCdefabcdeFABcDEFabCD"
      );

      const invalidExecutedBy = {
        ...validAction,
        executedBy: "invalid-address",
      };
      expect(() => ActionSchema.parse(invalidExecutedBy)).toThrow();
    });

    it("should coerce string timestamps to bigint", () => {
      const stringTimestamps = {
        ...validAction,
        activeAt: "1700000100", // String instead of bigint
      } as unknown;
      const result = ActionSchema.parse(stringTimestamps);
      expect(result.activeAt).toBe(1_700_000_100n);
    });
  });

  describe("ActionsListSchema", () => {
    it("should validate list parameters with all filters", () => {
      const validInput = {
        status: "PENDING" as const,
        target: "0x1234567890123456789012345678901234567890",
        name: "settlement",
      };
      const result = ActionsListSchema.parse(validInput);
      expect(result.status).toBe("PENDING");
      expect(result.target).toBe("0x1234567890123456789012345678901234567890");
      expect(result.name).toBe("settlement");
    });

    it("should work without optional filters", () => {
      const minimalInput = {};
      const result = ActionsListSchema.parse(minimalInput);
      expect(result.status).toBeUndefined();
      expect(result.target).toBeUndefined();
      expect(result.name).toBeUndefined();
    });

    it("should reject invalid status filter", () => {
      const invalidStatus = {
        status: "INVALID_STATUS",
      };
      expect(() => ActionsListSchema.parse(invalidStatus)).toThrow();
    });

    it("should reject invalid target address", () => {
      const invalidTarget = {
        target: "not-an-address",
      };
      expect(() => ActionsListSchema.parse(invalidTarget)).toThrow();
    });

    it("should validate individual filter types", () => {
      // Test status filter
      const statusFilter = { status: "EXECUTED" as const };
      const statusResult = ActionsListSchema.parse(statusFilter);
      expect(statusResult.status).toBe("EXECUTED");

      // Test target filter
      const targetFilter = {
        target: "0x1234567890123456789012345678901234567890",
      };
      const targetResult = ActionsListSchema.parse(targetFilter);
      expect(targetResult.target).toBe(
        "0x1234567890123456789012345678901234567890"
      );

      // Test name filter
      const nameFilter = { name: "bond maturity" };
      const nameResult = ActionsListSchema.parse(nameFilter);
      expect(nameResult.name).toBe("bond maturity");
    });
  });

  describe("Response Schemas", () => {
    const mockAction = {
      id: "action-123",
      name: "Test Action",
      target: "0x1234567890123456789012345678901234567890",
      activeAt: 1_700_000_100n,
      status: "ACTIVE" as const,
      executedAt: null,
      executedBy: null,
      executor: {
        id: "executor-1",
        executors: ["0x1234567890123456789012345678901234567890"],
      },
    };

    it("should validate ActionsListResponseSchema", () => {
      const validResponse = [mockAction];
      const result = ActionsListResponseSchema.parse(validResponse);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(mockAction.id);
    });

    it("should validate ActionsListResponseSchema with empty data", () => {
      const emptyResponse: (typeof mockAction)[] = [];
      const result = ActionsListResponseSchema.parse(emptyResponse);
      expect(result).toHaveLength(0);
    });

    it("should validate ActionsListDataSchema", () => {
      const validDataArray = [mockAction];
      const result = ActionsListDataSchema.parse(validDataArray);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("action-123");
    });
  });

  describe("Edge Cases and Boundary Values", () => {
    it("should handle very large BigInt timestamps", () => {
      const largeTimestamp = {
        id: "action-123",
        name: "Test Action",
        target: "0x1234567890123456789012345678901234567890",
        activeAt: 99_999_999_999_999_999n,
        status: "PENDING" as const,
        executedAt: null,
        executedBy: null,
        executor: {
          id: "executor-1",
          executors: [],
        },
      };
      const result = ActionSchema.parse(largeTimestamp);
      expect(result.activeAt).toBe(99_999_999_999_999_999n);
    });

    it("should handle maximum array length for executors", () => {
      const manyExecutors = Array.from(
        { length: 100 },
        (_, i) => `0x${i.toString(16).padStart(40, "0")}`
      );
      const executor = {
        id: "executor-many",
        executors: manyExecutors,
      };
      const result = ActionExecutorSchema.parse(executor);
      expect(result.executors).toHaveLength(100);
    });

    it("should handle very long string values", () => {
      const longString = "a".repeat(1000);
      const actionWithLongStrings = {
        id: longString,
        name: longString,
        target: "0x1234567890123456789012345678901234567890",
        activeAt: 1_700_000_100n,
        status: "PENDING" as const,
        executedAt: null,
        executedBy: null,
        executor: {
          id: longString,
          executors: ["0x1234567890123456789012345678901234567890"],
        },
      };
      const result = ActionSchema.parse(actionWithLongStrings);
      expect(result.name).toBe(longString);
      expect(result.id).toBe(longString);
    });

    it("should handle empty filters", () => {
      const emptyFilters = {};
      const result = ActionsListSchema.parse(emptyFilters);
      expect(result).toEqual({});
    });
  });
});
