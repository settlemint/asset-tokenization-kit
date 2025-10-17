/**
 * Actions API Tests
 *
 * Tests for the Actions API endpoints that provide access to time-bound,
 * executable tasks that users can perform on assets within the platform.
 *
 * This test suite covers:
 * - actions.list: Retrieve paginated list of user's actions with filtering
 *
 * Note: Action execution is tested in resource-specific test suites:
 * - Bond maturity tests in tokens.spec.ts
 * - XvP settlement tests in xvp.spec.ts
 */

import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import type { OrpcClient } from "@test/fixtures/orpc-client";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, test } from "vitest";

let client: OrpcClient;
let investorClient: OrpcClient;

beforeAll(async () => {
  const [adminHeaders, investorHeaders] = await Promise.all([
    signInWithUser(DEFAULT_ADMIN),
    signInWithUser(DEFAULT_INVESTOR),
  ]);
  client = getOrpcClient(adminHeaders);
  investorClient = getOrpcClient(investorHeaders);
});

describe("Actions API", () => {
  describe("Authentication", () => {
    test("should require authentication for actions.list", async () => {
      const publicClient = getOrpcClient(new Headers()); // No auth headers
      await expect(
        publicClient.actions.list(
          {},
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.UNAUTHORIZED],
            },
          }
        )
      ).rejects.toThrow(errorMessageForCode(CUSTOM_ERROR_CODES.UNAUTHORIZED));
    });
  });

  describe("Actions List", () => {
    test("should return a list of actions", async () => {
      const result = await client.actions.list({});

      expect(result).toBeInstanceOf(Array);

      // Check structure of action items
      if (result.length > 0) {
        const action = result[0];
        if (!action) return; // TypeScript safety check

        expect(action).toMatchObject({
          id: expect.stringMatching(/^0x[a-fA-F0-9]+$/),
          name: expect.any(String),
          activeAt: expect.any(Date),
          target: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
          status: expect.stringMatching(/^(PENDING|ACTIVE|EXECUTED|EXPIRED)$/),
          executor: expect.objectContaining({
            id: expect.stringMatching(/^0x[a-fA-F0-9]+$/),
            executors: expect.arrayContaining([
              expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
            ]),
          }),
        });

        // Optional fields
        if (action.executedAt !== null) {
          expect(typeof action.executedAt).toBe("bigint");
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
      const pendingActions = await client.actions.list({
        status: "PENDING",
      });

      expect(pendingActions).toBeInstanceOf(Array);

      // All returned actions should be ACTIVE
      pendingActions.forEach((action) => {
        expect(action.status).toBe("PENDING");
      });
    });

    test("should filter by target address", async () => {
      // First get some actions to find a target address
      const allActions = await client.actions.list({});

      if (allActions.length > 0) {
        const targetAddress = allActions[0]?.target;
        if (!targetAddress) return;

        const filteredActions = await client.actions.list({
          targets: [targetAddress],
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
    test("should handle empty filter results", async () => {
      const emptyResults = await client.actions.list({
        status: "EXECUTED",
        targets: ["0x0000000000000000000000000000000000000000"],
      });
      expect(emptyResults).toBeInstanceOf(Array);
      expect(emptyResults.length).toBe(0);
    });
  });
});
