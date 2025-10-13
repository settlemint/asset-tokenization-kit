import { isEthereumAddress } from "@atk/zod/ethereum-address";
import { isEthereumCompositeId } from "@atk/zod/ethereum-composite-id";
import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Actions", () => {
  it("should fetch a list of all actions", async () => {
    const query = theGraphGraphql(
      `query {
        actions(orderBy: createdAt, orderDirection: desc) {
          id
          name
          target
          createdAt
          activeAt
          expiresAt
          executed
          executedAt
          executedBy
          identifier
          executor {
            id
            executors
            actions {
              id
              name
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Verify we have at least one action from the hardhat script
    expect(response.actions.length).toBeGreaterThanOrEqual(1);

    const action = response.actions[0];

    // Verify action structure
    expect(action?.id).toBeDefined();
    expect(action?.name).toBeDefined();
    expect(action?.target).toBeDefined();
    expect(action?.createdAt).toBeDefined();
    expect(action?.activeAt).toBeDefined();
    expect(action?.executed).toBeDefined();
    expect(typeof action?.executed).toBe("boolean");

    // Verify executor relationship
    expect(action?.executor).toBeDefined();
    expect(action?.executor.id).toBeDefined();
    expect(Array.isArray(action?.executor.executors)).toBe(true);
    expect(Array.isArray(action?.executor.actions)).toBe(true);
    expect(action?.executor.executors.length).toBeGreaterThan(0);
  });

  it("should fetch XvP Settlement approval actions", async () => {
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
          target
          executed
          identifier
          executor {
            id
            executors
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have at least 1 approval action from the unapproved settlement
    expect(response.actions.length).toBeGreaterThanOrEqual(1);

    const approvalActions = response.actions;

    // Verify approval action structure
    approvalActions.forEach((action) => {
      expect(action.id).toBeDefined();
      expect(action.name).toBe("ApproveXvPSettlement");
      expect(action.target).toBeDefined();
      expect(typeof action.executed).toBe("boolean");
      expect(action.identifier).toBeDefined();

      // Verify executor relationship
      expect(action.executor).toBeDefined();
      expect(action.executor.id).toBeDefined();
      expect(Array.isArray(action.executor.executors)).toBe(true);
      expect(action.executor.executors.length).toBe(1); // One executor per approval action
    });
  });

  it("should fetch bond maturity actions", async () => {
    const query = theGraphGraphql(
      `query {
        actions(
          where: {
            name: "MatureBond"
          },
          orderBy: createdAt,
          orderDirection: desc
        ) {
          id
          name
          target
          createdAt
          activeAt
          expiresAt
          executed
          executedAt
          executedBy
          identifier
          executor {
            id
            executors
            actions {
              id
              name
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    expect(response.actions.length).toBeGreaterThanOrEqual(1);

    // Should have at least 1 bond maturity action if bonds exist
    if (response.actions.length > 0) {
      const bondActions = response.actions;

      // Verify bond maturity action structure
      bondActions.forEach((action) => {
        expect(action.id).toBeDefined();
        expect(action.name).toBe("MatureBond");
        expect(action.target).toBeDefined();
        expect(action.createdAt).toBeDefined();
        expect(action.activeAt).toBeDefined(); // Should be set to maturity date
        expect(typeof action.executed).toBe("boolean"); // Can be true or false depending on test scenario
        expect(action.identifier).toBeDefined(); // Bond actions use bond address as identifier
        expect(isEthereumAddress(action.identifier)).toBe(true); // Should be a valid address

        // Verify execution state consistency
        if (action.executed) {
          expect(action.executedAt).toBeDefined();
          expect(action.executedBy).toBeDefined();
        } else {
          expect(action.executedAt).toBeNull();
          expect(action.executedBy).toBeNull();
        }

        // Verify executor relationship
        expect(action.executor).toBeDefined();
        expect(action.executor.id).toBeDefined();
        expect(Array.isArray(action.executor.executors)).toBe(true);
        expect(action.executor.executors.length).toBeGreaterThan(0);
      });
    }
  });

  it("should fetch bond redeem actions", async () => {
    const query = theGraphGraphql(
      `query {
        actions(
          where: {
            name: "RedeemBond"
          },
          orderBy: createdAt,
          orderDirection: desc
        ) {
          id
          name
          target
          createdAt
          activeAt
          expiresAt
          executed
          executedAt
          executedBy
          identifier
          executor {
            id
            executors
            actions {
              id
              name
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    expect(response.actions.length).toBeGreaterThanOrEqual(1);

    // Should have at least 1 bond redeem action if bonds exist
    if (response.actions.length > 0) {
      const bondActions = response.actions;

      // Verify bond maturity action structure
      bondActions.forEach((action) => {
        expect(action.id).toBeDefined();
        expect(action.name).toBe("RedeemBond");
        expect(action.target).toBeDefined();
        expect(action.createdAt).toBeDefined();
        expect(action.activeAt).toBeDefined(); // Should be set to maturity date
        expect(typeof action.executed).toBe("boolean"); // Can be true or false depending on test scenario
        expect(action.identifier).toBeDefined(); // Bond actions use bond address as identifier
        expect(isEthereumCompositeId(action.identifier)).toBe(true); // Should be a valid composite id (token address + account address)

        // Verify execution state consistency
        if (action.executed) {
          expect(action.executedAt).toBeDefined();
          expect(action.executedBy).toBeDefined();
        } else {
          expect(action.executedAt).toBeNull();
          expect(action.executedBy).toBeNull();
        }

        // Verify executor relationship
        expect(action.executor).toBeDefined();
        expect(action.executor.id).toBeDefined();
        expect(Array.isArray(action.executor.executors)).toBe(true);
        expect(action.executor.executors.length).toBeGreaterThan(0);
      });
    }

    // Has 1 bond redeem executed action
    const executedActions = response.actions.filter(
      (action) => action.executed
    );
    expect(executedActions.length).toBe(1);
  });

  it("should have proper action-executor relationships", async () => {
    const query = theGraphGraphql(
      `query {
        actionExecutors(orderBy: id) {
          id
          executors
          actions {
            id
            name
            target
            executed
            executor {
              id
            }
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have at least 1 action executor
    expect(response.actionExecutors.length).toBeGreaterThanOrEqual(1);

    const actionExecutors = response.actionExecutors;

    // Verify action executor structure and relationships
    actionExecutors.forEach((executor) => {
      expect(executor.id).toBeDefined();
      expect(Array.isArray(executor.executors)).toBe(true);
      expect(executor.executors.length).toBeGreaterThan(0);
      expect(Array.isArray(executor.actions)).toBe(true);
      expect(executor.actions.length).toBeGreaterThan(0);

      // Verify bidirectional relationships
      executor.actions.forEach((action) => {
        expect(action.id).toBeDefined();
        expect(action.name).toBeDefined();
        expect(action.target).toBeDefined();
        expect(typeof action.executed).toBe("boolean");
        expect(action.executor.id).toBe(executor.id); // Reverse relationship should match
      });
    });
  });

  it("should filter actions by execution status", async () => {
    const query = theGraphGraphql(
      `query {
        executedActions: actions(where: { executed: true }) {
          id
          name
          executed
          executedAt
          executedBy
        }
        pendingActions: actions(where: { executed: false }) {
          id
          name
          executed
          executedAt
          executedBy
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Verify executed actions
    response.executedActions.forEach((action) => {
      expect(action.executed).toBe(true);
      expect(action.executedAt).toBeDefined();
      expect(action.executedBy).toBeDefined();
    });

    // Verify pending actions
    response.pendingActions.forEach((action) => {
      expect(action.executed).toBe(false);
      expect(action.executedAt).toBeNull();
      expect(action.executedBy).toBeNull();
    });

    // Should have at least some pending actions from setup
    expect(response.pendingActions.length).toBeGreaterThan(0);
  });

  it("should have actions in different execution states", async () => {
    const query = theGraphGraphql(
      `query {
        executedActions: actions(where: { executed: true }) {
          id
          name
          executed
        }
        pendingActions: actions(where: { executed: false }) {
          id
          name
          executed
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have both executed and pending actions from different settlement scenarios
    expect(response.executedActions.length).toBeGreaterThan(0);
    expect(response.pendingActions.length).toBeGreaterThan(0);

    // Verify executed actions
    response.executedActions.forEach((action) => {
      expect(action.executed).toBe(true);
    });

    // Verify pending actions
    response.pendingActions.forEach((action) => {
      expect(action.executed).toBe(false);
    });
  });
});
