import { isEthereumAddress } from "@atk/zod/ethereum-address";
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
          status
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
    expect(action?.status).toBeDefined();

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
          status
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
      expect(action.status).toBeDefined();
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
          status
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
        expect(action.status).toBeDefined();
        expect(action.identifier).toBeDefined(); // Bond actions use bond address as identifier
        expect(isEthereumAddress(action.identifier)).toBe(true); // Should be a valid address

        // Verify execution state consistency
        if (action.status === "EXECUTED") {
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

    // Has 1 bond maturity executed action
    const executedActions = response.actions.filter(
      (action) => action.status === "EXECUTED"
    );
    expect(executedActions.length).toBe(1);
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
          executedAt
          executedBy
          identifier
          status
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
        expect(action.status).toBeDefined();
        expect(action.identifier).toBeDefined(); // Bond actions use bond address as identifier
        expect(action.identifier?.startsWith("0x")).toBe(true); // Should be a valid composite id (token address + account address)

        // Verify execution state consistency
        if (action.status === "EXECUTED") {
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
      (action) => action.status === "EXECUTED"
    );
    expect(executedActions.length).toBe(1);
  });

  it("should fetch claim yield actions", async () => {
    const query = theGraphGraphql(
      `query {
        actions(
          where: {
            name: "ClaimYield"
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
          executedAt
          executedBy
          identifier
          status
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

    // Should have at least 1 claim yield action
    if (response.actions.length > 0) {
      const bondActions = response.actions;

      // Verify claim yield action structure
      bondActions.forEach((action) => {
        expect(action.id).toBeDefined();
        expect(action.name).toBe("ClaimYield");
        expect(action.target).toBeDefined();
        expect(action.createdAt).toBeDefined();
        expect(action.activeAt).toBeDefined(); // Should be set to maturity date
        expect(action.status).toBeDefined();
        expect(action.identifier).toBeDefined(); // Bond actions use bond address as identifier
        expect(action.identifier?.startsWith("0x")).toBe(true); // Should be a valid composite id (token address + account address)

        // Verify execution state consistency
        if (action.status === "EXECUTED") {
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

    // Has 3 claim yield executed actions (for 3 periods)
    const executedActions = response.actions.filter(
      (action) => action.status === "EXECUTED"
    );
    expect(executedActions.length).toBe(3);
    // Executed actions are on the same target
    expect(
      executedActions.every(
        (action) => executedActions[0]?.target === action.target
      )
    ).toBe(true);
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
            status
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
        expect(action.status).toBeDefined();
        expect(action.executor.id).toBe(executor.id); // Reverse relationship should match
      });
    });
  });

  it("should filter actions by execution status", async () => {
    const query = theGraphGraphql(
      `query {
        executedActions: actions(where: { status: EXECUTED }) {
          id
          name
          status
          executedAt
          executedBy
        }
        pendingActions: actions(where: { status: PENDING }) {
          id
          name
          status
          executedAt
          executedBy
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Verify executed actions
    response.executedActions.forEach((action) => {
      expect(action.status).toBe("EXECUTED");
      expect(action.executedAt).toBeDefined();
      expect(action.executedBy).toBeDefined();
    });

    // Verify pending actions
    response.pendingActions.forEach((action) => {
      expect(action.status).not.toBe("EXECUTED");
      expect(action.executedAt).toBeNull();
      expect(action.executedBy).toBeNull();
    });

    // Should have at least some pending actions from setup
    expect(response.pendingActions.length).toBeGreaterThan(0);
  });

  it("should have actions in different execution states", async () => {
    const query = theGraphGraphql(
      `query {
        executedActions: actions(where: { status: EXECUTED }) {
          id
          name
          status
        }
        otherActions: actions(where: { status_not: EXECUTED }) {
          id
          name
          status
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have both executed and pending actions from different settlement scenarios
    expect(response.executedActions.length).toBeGreaterThan(0);
    expect(response.otherActions.length).toBeGreaterThan(0);

    // Verify executed actions
    response.executedActions.forEach((action) => {
      expect(action.status).toBe("EXECUTED");
    });

    // Verify pending actions
    response.otherActions.forEach((action) => {
      expect(action.status).not.toBe("EXECUTED");
    });
  });
});
