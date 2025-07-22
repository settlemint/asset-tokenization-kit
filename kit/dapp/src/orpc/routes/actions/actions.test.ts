/**
 * Actions Schema Tests
 *
 * Unit tests for actions schemas and validation.
 * Tests all input/output schemas for actions-related operations.
 * @module ActionsTests
 */
import { safeParse } from "@/lib/zod";
import { describe, expect, it, mock } from "bun:test";
import {
  ActionSchema,
  ActionExecutorSchema,
  ActionStatusSchema,
  ActionsListSchema,
  ActionsListResponseSchema,
  ActionsResponseSchema,
  ActionsListDataSchema,
} from "./routes/actions.list.schema";
import {
  ActionsReadSchema,
  ActionsReadResponseSchema,
} from "./routes/actions.read.schema";

// Mock the logger to avoid console output during tests
mock.module("@settlemint/sdk-utils/logging", () => ({
  createLogger: () => ({
    error: mock(() => undefined),
    warn: mock(() => undefined),
    info: mock(() => undefined),
    debug: mock(() => undefined),
  }),
}));

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
        const result = safeParse(ActionStatusSchema, status);
        expect(result).toBe(status);
      }
    });

    it("should reject invalid status values", () => {
      const invalidStatuses = ["UNKNOWN", "pending", "active", "", "COMPLETED"];

      for (const status of invalidStatuses) {
        expect(() => safeParse(ActionStatusSchema, status)).toThrow();
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
      const result = safeParse(ActionExecutorSchema, validExecutor);
      expect(result.id).toBe("executor-1");
      expect(result.executors).toHaveLength(2);
    });

    it("should reject executor with invalid addresses", () => {
      const invalidExecutor = {
        id: "executor-1",
        executors: ["invalid-address", "0x123"], // Invalid Ethereum addresses
      };
      expect(() => safeParse(ActionExecutorSchema, invalidExecutor)).toThrow();
    });

    it("should require id field", () => {
      const missingId = {
        executors: ["0x1234567890123456789012345678901234567890"],
      };
      expect(() => safeParse(ActionExecutorSchema, missingId)).toThrow();
    });

    it("should require executors array", () => {
      const missingExecutors = {
        id: "executor-1",
      };
      expect(() => safeParse(ActionExecutorSchema, missingExecutors)).toThrow();
    });

    it("should allow empty executors array", () => {
      const emptyExecutors = {
        id: "executor-1",
        executors: [],
      };
      const result = safeParse(ActionExecutorSchema, emptyExecutors);
      expect(result.executors).toHaveLength(0);
    });
  });

  describe("ActionSchema", () => {
    const validAction = {
      id: "action-123",
      name: "Test Action",
      target: "0x1234567890123456789012345678901234567890",
      createdAt: BigInt(1700000000),
      activeAt: BigInt(1700000100),
      expiresAt: BigInt(1700000200),
      requiredRole: "admin",
      status: "ACTIVE" as const,
      executed: false,
      executedAt: null,
      executedBy: null,
      identifier: "test-identifier",
      executor: {
        id: "executor-1",
        executors: ["0x1234567890123456789012345678901234567890"],
      },
    };

    it("should validate complete action object", () => {
      const result = safeParse(ActionSchema, validAction);
      expect(result.id).toBe("action-123");
      expect(result.name).toBe("Test Action");
      expect(result.status).toBe("ACTIVE");
      expect(result.createdAt).toBe(BigInt(1700000000));
    });

    it("should handle null optional fields", () => {
      const actionWithNulls = {
        ...validAction,
        expiresAt: null,
        requiredRole: null,
        executedAt: null,
        executedBy: null,
        identifier: null,
      };
      const result = safeParse(ActionSchema, actionWithNulls);
      expect(result.expiresAt).toBeNull();
      expect(result.requiredRole).toBeNull();
      expect(result.identifier).toBeNull();
    });

    it("should require all mandatory fields", () => {
      const requiredFields = [
        "id",
        "name",
        "target",
        "createdAt",
        "activeAt",
        "status",
        "executed",
        "executor",
      ];

      requiredFields.forEach((field) => {
        const incompleteAction = Object.fromEntries(
          Object.entries(validAction).filter(([key]) => key !== field)
        );
        expect(() => safeParse(ActionSchema, incompleteAction)).toThrow();
      });
    });

    it("should validate target as Ethereum address", () => {
      const invalidTarget = {
        ...validAction,
        target: "invalid-address",
      };
      expect(() => safeParse(ActionSchema, invalidTarget)).toThrow();
    });

    it("should validate executedBy as Ethereum address when present", () => {
      const validExecutedBy = {
        ...validAction,
        executedBy: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      };
      const result = safeParse(ActionSchema, validExecutedBy);
      // The ethereum address validator normalizes to checksum format
      expect(result.executedBy).toBe(
        "0xABcdEFABcdEFabcdEfAbCdefabcdeFABcDEFabCD"
      );

      const invalidExecutedBy = {
        ...validAction,
        executedBy: "invalid-address",
      };
      expect(() => safeParse(ActionSchema, invalidExecutedBy)).toThrow();
    });

    it("should validate bigint timestamps", () => {
      const stringTimestamps = {
        ...validAction,
        createdAt: "1700000000", // String instead of bigint
        activeAt: "1700000100",
      };
      expect(() => safeParse(ActionSchema, stringTimestamps)).toThrow();
    });
  });

  describe("ActionsListSchema", () => {
    it("should validate list parameters with all filters", () => {
      const validInput = {
        offset: 0,
        limit: 20,
        orderBy: "createdAt",
        orderDirection: "desc" as const,
        status: "PENDING" as const,
        target: "0x1234567890123456789012345678901234567890",
        requiredRole: "admin",
        name: "settlement",
      };
      const result = safeParse(ActionsListSchema, validInput);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.status).toBe("PENDING");
      expect(result.target).toBe("0x1234567890123456789012345678901234567890");
      expect(result.requiredRole).toBe("admin");
      expect(result.name).toBe("settlement");
    });

    it("should work without optional filters", () => {
      const minimalInput = {
        offset: 10,
        limit: 50,
      };
      const result = safeParse(ActionsListSchema, minimalInput);
      expect(result.offset).toBe(10);
      expect(result.limit).toBe(50);
      expect(result.status).toBeUndefined();
      expect(result.target).toBeUndefined();
      expect(result.requiredRole).toBeUndefined();
      expect(result.name).toBeUndefined();
    });

    it("should apply defaults when no params provided", () => {
      const emptyInput = {};
      const result = safeParse(ActionsListSchema, emptyInput);
      expect(result.offset).toBe(0);
      expect(result.limit).toBeUndefined();
      expect(result.orderDirection).toBe("asc");
      expect(result.orderBy).toBe("id");
    });

    it("should reject invalid status filter", () => {
      const invalidStatus = {
        status: "INVALID_STATUS",
      };
      expect(() => safeParse(ActionsListSchema, invalidStatus)).toThrow();
    });

    it("should reject invalid target address", () => {
      const invalidTarget = {
        target: "not-an-address",
      };
      expect(() => safeParse(ActionsListSchema, invalidTarget)).toThrow();
    });

    it("should validate individual filter types", () => {
      // Test status filter
      const statusFilter = { status: "EXECUTED" as const };
      const statusResult = safeParse(ActionsListSchema, statusFilter);
      expect(statusResult.status).toBe("EXECUTED");

      // Test target filter
      const targetFilter = {
        target: "0x1234567890123456789012345678901234567890",
      };
      const targetResult = safeParse(ActionsListSchema, targetFilter);
      expect(targetResult.target).toBe(
        "0x1234567890123456789012345678901234567890"
      );

      // Test role filter
      const roleFilter = { requiredRole: "executor" };
      const roleResult = safeParse(ActionsListSchema, roleFilter);
      expect(roleResult.requiredRole).toBe("executor");

      // Test name filter
      const nameFilter = { name: "bond maturity" };
      const nameResult = safeParse(ActionsListSchema, nameFilter);
      expect(nameResult.name).toBe("bond maturity");
    });
  });

  describe("ActionsReadSchema", () => {
    it("should validate read schema with valid ID", () => {
      const validInput = {
        id: "action-id-123",
      };
      const result = safeParse(ActionsReadSchema, validInput);
      expect(result.id).toBe("action-id-123");
    });

    it("should reject missing ID", () => {
      const missingId = {};
      expect(() => safeParse(ActionsReadSchema, missingId)).toThrow();
    });

    it("should accept various ID formats", () => {
      const idFormats = [
        "action-123",
        "0x1234567890123456789012345678901234567890123456789012345678901234",
        "uuid-format-id",
        "simple-id",
      ];

      for (const id of idFormats) {
        const input = { id };
        const result = safeParse(ActionsReadSchema, input);
        expect(result.id).toBe(id);
      }
    });
  });

  describe("Response Schemas", () => {
    const mockAction = {
      id: "action-123",
      name: "Test Action",
      target: "0x1234567890123456789012345678901234567890",
      createdAt: BigInt(1700000000),
      activeAt: BigInt(1700000100),
      expiresAt: null,
      requiredRole: null,
      status: "ACTIVE" as const,
      executed: false,
      executedAt: null,
      executedBy: null,
      identifier: null,
      executor: {
        id: "executor-1",
        executors: ["0x1234567890123456789012345678901234567890"],
      },
    };

    it("should validate ActionsListResponseSchema", () => {
      const validResponse = {
        data: [mockAction],
        total: 1,
        offset: 0,
        limit: 20,
      };
      const result = safeParse(ActionsListResponseSchema, validResponse);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(20);
    });

    it("should validate ActionsListResponseSchema with empty data", () => {
      const emptyResponse = {
        data: [],
        total: 0,
        offset: 0,
        limit: 20,
      };
      const result = safeParse(ActionsListResponseSchema, emptyResponse);
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should validate ActionsListResponseSchema without limit", () => {
      const noLimitResponse = {
        data: [mockAction],
        total: 1,
        offset: 0,
      };
      const result = safeParse(ActionsListResponseSchema, noLimitResponse);
      expect(result.limit).toBeUndefined();
    });

    it("should reject negative total or offset", () => {
      const negativeTotalResponse = {
        data: [],
        total: -1,
        offset: 0,
      };
      expect(() =>
        safeParse(ActionsListResponseSchema, negativeTotalResponse)
      ).toThrow();

      const negativeOffsetResponse = {
        data: [],
        total: 0,
        offset: -1,
      };
      expect(() =>
        safeParse(ActionsListResponseSchema, negativeOffsetResponse)
      ).toThrow();
    });

    it("should validate ActionsReadResponseSchema", () => {
      const validResponse = {
        data: mockAction,
      };
      const result = safeParse(ActionsReadResponseSchema, validResponse);
      expect(result.data.id).toBe("action-123");
      expect(result.data.name).toBe("Test Action");
    });

    it("should validate ActionsResponseSchema (GraphQL response)", () => {
      const validGraphQLResponse = {
        actions: [mockAction],
      };
      const result = safeParse(ActionsResponseSchema, validGraphQLResponse);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0]?.id).toBe("action-123");
    });

    it("should validate ActionsListDataSchema", () => {
      const validDataArray = [mockAction];
      const result = safeParse(ActionsListDataSchema, validDataArray);
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
        createdAt: BigInt("99999999999999999"),
        activeAt: BigInt("99999999999999999"),
        expiresAt: BigInt("99999999999999999"),
        requiredRole: null,
        status: "PENDING" as const,
        executed: false,
        executedAt: null,
        executedBy: null,
        identifier: null,
        executor: {
          id: "executor-1",
          executors: [],
        },
      };
      const result = safeParse(ActionSchema, largeTimestamp);
      expect(result.createdAt).toBe(BigInt("99999999999999999"));
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
      const result = safeParse(ActionExecutorSchema, executor);
      expect(result.executors).toHaveLength(100);
    });

    it("should handle very long string values", () => {
      const longString = "a".repeat(1000);
      const actionWithLongStrings = {
        id: longString,
        name: longString,
        target: "0x1234567890123456789012345678901234567890",
        createdAt: BigInt(1700000000),
        activeAt: BigInt(1700000100),
        expiresAt: null,
        requiredRole: longString,
        status: "PENDING" as const,
        executed: false,
        executedAt: null,
        executedBy: null,
        identifier: longString,
        executor: {
          id: longString,
          executors: ["0x1234567890123456789012345678901234567890"],
        },
      };
      const result = safeParse(ActionSchema, actionWithLongStrings);
      expect(result.name).toBe(longString);
      expect(result.identifier).toBe(longString);
    });

    it("should handle boundary pagination values", () => {
      const boundaryValues = [
        { offset: 0, limit: 1 }, // Minimum values
        { offset: 999999, limit: 1000 }, // Large values
        { offset: 0 }, // No limit
      ];

      for (const values of boundaryValues) {
        const result = safeParse(ActionsListSchema, values);
        expect(result.offset).toBe(values.offset);
        if (values.limit) {
          expect(result.limit).toBe(values.limit);
        }
      }
    });
  });
});
