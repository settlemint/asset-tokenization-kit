import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Actions", () => {
  it("should fetch a list of all actions", async () => {
    const query = theGraphGraphql(
      `query {
        actions(orderBy: createdAt, orderDirection: desc) {
          id
          name
          type
          createdAt
          activeAt
          expiresAt
          executedAt
          executed
          executor {
            id
            executors {
              id
            }
          }
          target {
            id
          }
          executedBy {
            id
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Verify we have actions from XvP settlement approvals
    expect(response.actions.length).toBeGreaterThanOrEqual(1);

    const actions = response.actions;

    // Verify action structure
    actions.forEach((action) => {
      expect(action.id).toBeDefined();
      expect(action.name).toBeDefined();
      expect(action.type).toBeDefined();
      expect(action.createdAt).toBeDefined();
      expect(action.activeAt).toBeDefined();
      expect(typeof action.executed).toBe("boolean");
      expect(action.executor.id).toBeDefined();
      expect(action.target.id).toBeDefined();

      // Verify executor has executors array
      expect(Array.isArray(action.executor.executors)).toBe(true);
      expect(action.executor.executors.length).toBeGreaterThan(0);

      // Verify timestamps are valid
      expect(BigInt(action.createdAt)).toBeGreaterThan(0n);
      expect(BigInt(action.activeAt)).toBeGreaterThan(0n);

      // If action has expiry, verify it's after activeAt
      if (action.expiresAt) {
        expect(BigInt(action.expiresAt)).toBeGreaterThan(
          BigInt(action.activeAt)
        );
      }

      // If action is executed, verify executedAt and executedBy are set
      if (action.executed) {
        expect(action.executedAt).toBeDefined();
        expect(action.executedBy).toBeDefined();
        expect(BigInt(action.executedAt!)).toBeGreaterThan(
          BigInt(action.activeAt)
        );
      }
    });
  });

  it("should fetch XvP settlement approval actions", async () => {
    // Note: Filter by 'name' field for specific action types
    // 'type' field contains user type ('User', 'Admin'), not action type
    const query = theGraphGraphql(
      `query {
        actions(
          where: {
            name: "ApproveXvPSettlement"
          },
          orderBy: createdAt,
          orderDirection: desc
        ) {
          id
          name
          type
          createdAt
          activeAt
          expiresAt
          executed
          executor {
            id
            executors {
              id
            }
          }
          target {
            id
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have approval actions from XvP settlement
    expect(response.actions.length).toBeGreaterThanOrEqual(1);

    const approvalActions = response.actions;

    // Verify approval action structure
    approvalActions.forEach((action) => {
      // 'name' field contains the specific action name
      expect(action.name).toBe("ApproveXvPSettlement");
      // 'type' field contains the user type who can execute this action
      expect(action.type).toBe("User");
      expect(action.executor.id).toBeDefined();
      expect(action.target.id).toBeDefined();

      // Approval actions should be active immediately
      expect(action.activeAt).toBeDefined();
      expect(BigInt(action.activeAt)).toBeLessThanOrEqual(
        BigInt(action.createdAt)
      );
    });
  });

  it("should fetch action executors", async () => {
    const query = theGraphGraphql(
      `query {
        actionExecutors {
          id
          executors {
            id
          }
          actions {
            id
            name
            type
            executed
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have at least one action executor
    expect(response.actionExecutors.length).toBeGreaterThanOrEqual(1);

    const executors = response.actionExecutors;

    // Verify executor structure
    executors.forEach((executor) => {
      expect(executor.id).toBeDefined();
      expect(Array.isArray(executor.executors)).toBe(true);
      expect(executor.executors.length).toBeGreaterThan(0);
      expect(Array.isArray(executor.actions)).toBe(true);

      // Verify each executor has actions
      if (executor.actions.length > 0) {
        executor.actions.forEach((action) => {
          expect(action.id).toBeDefined();
          expect(action.name).toBeDefined();
          expect(action.type).toBeDefined();
          expect(typeof action.executed).toBe("boolean");
        });
      }
    });
  });

  it("should filter actions by execution status", async () => {
    const executedQuery = theGraphGraphql(
      `query {
        actions(where: { executed: true }) {
          id
          executed
          executedAt
          executedBy {
            id
          }
        }
      }`
    );

    const pendingQuery = theGraphGraphql(
      `query {
        actions(where: { executed: false }) {
          id
          executed
          executedAt
          executedBy {
            id
          }
        }
      }`
    );

    const [executedResponse, pendingResponse] = await Promise.all([
      theGraphClient.request(executedQuery),
      theGraphClient.request(pendingQuery),
    ]);

    // Verify executed actions have proper fields
    executedResponse.actions.forEach((action) => {
      expect(action.executed).toBe(true);
      expect(action.executedAt).toBeDefined();
      expect(action.executedBy?.id).toBeDefined();
    });

    // Verify pending actions don't have execution fields
    pendingResponse.actions.forEach((action) => {
      expect(action.executed).toBe(false);
      expect(action.executedAt).toBeNull();
      expect(action.executedBy).toBeNull();
    });
  });

  it("should fetch actions with time-based filtering", async () => {
    const currentTime = Math.floor(Date.now() / 1000);

    const activeQuery = theGraphGraphql(
      `query($currentTime: BigInt!) {
        actions(
          where: {
            activeAt_lte: $currentTime,
            executed: false
          }
        ) {
          id
          activeAt
          expiresAt
          executed
        }
      }`
    );

    const response = await theGraphClient.request(activeQuery, {
      currentTime: currentTime.toString(),
    });

    // Verify all returned actions are currently active
    response.actions.forEach((action) => {
      expect(BigInt(action.activeAt)).toBeLessThanOrEqual(BigInt(currentTime));
      expect(action.executed).toBe(false);

      // If action has expiry, verify it hasn't expired
      if (action.expiresAt) {
        expect(BigInt(action.expiresAt)).toBeGreaterThan(BigInt(currentTime));
      }
    });
  });

  it("should fetch actions by type", async () => {
    const query = theGraphGraphql(
      `query {
        actions {
          id
          type
        }
      }`
    );

    const response = await theGraphClient.request(query);

    // Get unique action types
    const actionTypes = [
      ...new Set(response.actions.map((action) => action.type)),
    ];

    // Should have at least the User type (user types, not action types)
    expect(actionTypes).toContain("User");

    // Verify each type has proper format
    actionTypes.forEach((type) => {
      expect(type).toBeDefined();
      expect(type.length).toBeGreaterThan(0);
    });
  });
});
