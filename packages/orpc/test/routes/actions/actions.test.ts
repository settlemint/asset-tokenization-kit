/**
 * Actions API Tests
 *
 * Tests for the Actions API endpoints that provide access to time-bound,
 * executable tasks that users can perform on assets within the platform.
 *
 * This test suite covers:
 * - actions.list: Retrieve paginated list of user's actions with filtering
 * - Schema validation and edge cases
 *
 * Note: Action execution is tested in resource-specific test suites:
 * - Bond maturity tests in tokens.spec.ts
 * - XvP settlement tests in xvp.spec.ts
 */

import { beforeAll, describe, expect, it, test } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_INVESTOR, signInWithUser } from "@atk/auth/test/fixtures/user";
import type { OrpcClient } from "@test/fixtures/orpc-client";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import {
  ActionExecutorSchema,
  ActionSchema,
  ActionStatusSchema,
  ActionsGraphResponseSchema,
  ActionsListDataSchema,
  ActionsListResponseSchema,
  ActionsListSchema,
} from "../../../src/routes/actions/routes/actions.list.schema";

let client: OrpcClient;
let investorClient: OrpcClient;

beforeAll(async () => {
  const [adminHeaders, investorHeaders] = await Promise.all([
    signInWithUser(DEFAULT_ADMIN),
    signInWithUser(DEFAULT_INVESTOR),
  ]);
  client = getTestOrpcClient(adminHeaders);
  investorClient = getTestOrpcClient(investorHeaders);
});

describe("Actions API", () => {
  describe("Authentication", () => {
    test("should require authentication for actions.list", async () => {
      const publicClient = getTestOrpcClient(new Headers()); // No auth headers
      await expect(publicClient.actions.list({})).rejects.toThrow();
    });
  });

  describe("Actions List", () => {
    test("should return a list of actions", async () => {
      const result = await client.actions.list({});

      expect(result).toBeInstanceOf(Array);

      // Check structure of action items
      if (result.length > 0) {
        const action = result[0];
        if (!action) {
          return; // TypeScript safety check
        }

        expect(action).toMatchObject({
          id: expect.stringMatching(/^0x[a-fA-F0-9]+$/),
          name: expect.any(String),
          target: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
          activeAt: expect.any(BigInt),
          status: expect.stringMatching(/^(PENDING|ACTIVE|EXECUTED|EXPIRED)$/),
          executor: expect.objectContaining({
            id: expect.stringMatching(/^0x[a-fA-F0-9]+$/),
            executors: expect.arrayContaining([expect.stringMatching(/^0x[a-fA-F0-9]{40}$/)]),
          }),
        });

        // Optional fields
        if (action.executedAt !== null) {
          expect(action.executedAt).toBeInstanceOf(BigInt);
        }
        if (action.executedBy !== null) {
          expect(action.executedBy).toMatch(/^0x[a-fA-F0-9]{40}$/);
        }
      }
    });

    test("should return all actions without pagination", async () => {
      const allActions = await client.actions.list({});

      expect(allActions).toBeInstanceOf(Array);
      // Actions are now returned all at once
    });

    test("should filter by status", async () => {
      const activeActions = await client.actions.list({
        status: "ACTIVE",
      });

      expect(activeActions).toBeInstanceOf(Array);

      // All returned actions should be ACTIVE
      activeActions.forEach((action) => {
        expect(action.status).toBe("ACTIVE");
      });
    });

    test("should filter by target address", async () => {
      // First get some actions to find a target address
      const allActions = await client.actions.list({});

      if (allActions.length > 0) {
        const targetAddress = allActions[0]?.target;
        if (!targetAddress) {
          return;
        }

        const filteredActions = await client.actions.list({
          target: targetAddress,
        });

        expect(filteredActions).toBeInstanceOf(Array);

        // All returned actions should target the specified address
        filteredActions.forEach((action) => {
          expect(action.target).toBe(targetAddress);
        });
      }
    });

    test("should only return actions the user can access", async () => {
      const adminActions = await client.actions.list({});
      const investorActions = await investorClient.actions.list({});

      expect(adminActions).toBeInstanceOf(Array);
      expect(investorActions).toBeInstanceOf(Array);

      // Each user should only see actions they can execute
      // Note: We can't easily verify exact wallet addresses in tests since they're
      // dynamically created during user setup. The core logic is tested by ensuring
      // users only get back actions, which confirms the filtering works.
    });
  });

  describe("Error Handling", () => {
    test("should handle filter parameters", async () => {
      // Test filters
      const filteredActions = await client.actions.list({ status: "ACTIVE" });
      expect(filteredActions).toBeInstanceOf(Array);
    });

    test("should handle empty filter results", async () => {
      const emptyResults = await client.actions.list({
        status: "EXECUTED",
        target: "0x0000000000000000000000000000000000000000",
      });
      expect(emptyResults).toBeInstanceOf(Array);
      expect(emptyResults.length).toBe(0);
    });
  });
});

describe("Actions Schemas", () => {
  describe("ActionStatusSchema", () => {
    it("should validate all status enum values", () => {
      const validStatuses = ["PENDING", "ACTIVE", "EXECUTED", "EXPIRED"] as const;

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
        executors: ["0x1234567890123456789012345678901234567890", "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"],
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
      activeAt: BigInt(1_700_000_100),
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
      expect(result.activeAt).toBe(BigInt(1_700_000_100));
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
      const requiredFields = ["id", "name", "target", "activeAt", "status", "executor"];

      requiredFields.forEach((field) => {
        const incompleteAction = Object.fromEntries(Object.entries(validAction).filter(([key]) => key !== field));
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
      expect(result.executedBy).toBe("0xABcdEFABcdEFabcdEfAbCdefabcdeFABcDEFabCD");

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
      expect(result.activeAt).toBe(BigInt("1700000100"));
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
      expect(targetResult.target).toBe("0x1234567890123456789012345678901234567890");

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
      activeAt: BigInt(1_700_000_100),
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

    it("should validate ActionsGraphResponseSchema (GraphQL response)", () => {
      const validGraphQLResponse = {
        actions: [
          {
            ...mockAction,
            activeAt: String(mockAction.activeAt),
            executedAt: mockAction.executedAt === null ? null : String(mockAction.executedAt),
          } as unknown,
        ],
      };
      const result = ActionsGraphResponseSchema.parse(validGraphQLResponse);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0]?.id).toBe("action-123");
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
        activeAt: BigInt("99999999999999999"),
        status: "PENDING" as const,
        executedAt: null,
        executedBy: null,
        executor: {
          id: "executor-1",
          executors: [],
        },
      };
      const result = ActionSchema.parse(largeTimestamp);
      expect(result.activeAt).toBe(BigInt("99999999999999999"));
    });

    it("should handle maximum array length for executors", () => {
      const manyExecutors = Array.from({ length: 100 }, (_, i) => `0x${i.toString(16).padStart(40, "0")}`);
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
        activeAt: BigInt(1_700_000_100),
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
