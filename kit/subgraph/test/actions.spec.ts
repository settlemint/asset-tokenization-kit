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
    expect(action.id).toBeDefined();
    expect(action.name).toBeDefined();
    expect(action.target).toBeDefined();
    expect(action.createdAt).toBeDefined();
    expect(action.activeAt).toBeDefined();
    expect(action.executed).toBeDefined();
    expect(typeof action.executed).toBe("boolean");

    // Verify executor relationship
    expect(action.executor).toBeDefined();
    expect(action.executor.id).toBeDefined();
    expect(Array.isArray(action.executor.executors)).toBe(true);
    expect(Array.isArray(action.executor.actions)).toBe(true);
    expect(action.executor.executors.length).toBeGreaterThan(0);
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

    // Should have at least 2 approval actions (one for each participant from approved scenario)
    expect(response.actions.length).toBeGreaterThanOrEqual(2);

    const approvalActions = response.actions;

    // Verify approval action structure
    approvalActions.forEach((action) => {
      expect(action.id).toBeDefined();
      expect(action.name).toBe("ApproveXvPSettlement");
      expect(action.target).toBeDefined();
      expect(action.createdAt).toBeDefined();
      expect(action.activeAt).toBeDefined();
      expect(typeof action.executed).toBe("boolean"); // Can be true or false depending on scenario
      expect(action.identifier).toBeDefined(); // Should have settlement ID as identifier

      // Verify executor relationship
      expect(action.executor).toBeDefined();
      expect(action.executor.id).toBeDefined();
      expect(Array.isArray(action.executor.executors)).toBe(true);
      expect(action.executor.executors.length).toBe(1); // One executor per approval action
    });
  });

  it("should fetch XvP Settlement execution actions", async () => {
    const query = theGraphGraphql(
      `query {
        actions(
          where: {
            name: "ExecuteXvPSettlement"
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

    // Should have at least 1 execution action
    expect(response.actions.length).toBeGreaterThanOrEqual(1);

    const executionActions = response.actions;

    // Verify execution action structure
    executionActions.forEach((action) => {
      expect(action.id).toBeDefined();
      expect(action.name).toBe("ExecuteXvPSettlement");
      expect(action.target).toBeDefined();
      expect(action.createdAt).toBeDefined();
      expect(action.activeAt).toBeDefined();
      expect(typeof action.executed).toBe("boolean"); // Can be true or false depending on scenario
      expect(action.identifier).toBeDefined(); // Should have settlement ID as identifier

      // Verify executor relationship
      expect(action.executor).toBeDefined();
      expect(action.executor.id).toBeDefined();
      expect(Array.isArray(action.executor.executors)).toBe(true);
      expect(action.executor.executors.length).toBeGreaterThan(0);
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
        expect(action.identifier).toMatch(/^0x[a-fA-F0-9]{40}$/); // Should be a valid address

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

  it("should filter actions by name", async () => {
    const query = theGraphGraphql(
      `query {
        adminActions: actions(where: { name: "MatureBond" }) {
          id
          name
        }
        userActions: actions(where: { name_in: ["ApproveXvPSettlement", "ExecuteXvPSettlement"] }) {
          id
          name
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Verify admin actions
    response.adminActions.forEach((action) => {
      expect(action.name).toBe("MatureBond"); // Currently only bond maturity is Admin type
    });

    // Verify user actions
    response.userActions.forEach((action) => {
      expect(["ApproveXvPSettlement", "ExecuteXvPSettlement"]).toContain(
        action.name
      );
    });

    // Should have at least some user actions from XvP settlements
    expect(response.userActions.length).toBeGreaterThan(0);
  });

  it("should have valid action timing", async () => {
    const query = theGraphGraphql(
      `query {
        actions(orderBy: createdAt, orderDirection: desc) {
          id
          name
          createdAt
          activeAt
          expiresAt
        }
      }`
    );
    const response = await theGraphClient.request(query);

    expect(response.actions.length).toBeGreaterThan(0);

    response.actions.forEach((action) => {
      // createdAt should be defined and valid
      expect(action.createdAt).toBeDefined();
      expect(parseInt(action.createdAt)).toBeGreaterThan(0);

      // activeAt should be defined and valid
      expect(action.activeAt).toBeDefined();
      expect(parseInt(action.activeAt)).toBeGreaterThan(0);

      // activeAt should be >= createdAt
      expect(parseInt(action.activeAt)).toBeGreaterThanOrEqual(
        parseInt(action.createdAt)
      );

      // If expiresAt is set, it should be > activeAt
      if (action.expiresAt) {
        expect(parseInt(action.expiresAt)).toBeGreaterThan(
          parseInt(action.activeAt)
        );
      }
    });
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

  describe("Edge Cases and Validation", () => {
    it("should handle actions with null expiration correctly", async () => {
      const query = theGraphGraphql(
        `query {
          actions(where: { expiresAt: null }) {
            id
            name
            expiresAt
            status
            executed
          }
        }`
      );
      const response = await theGraphClient.request(query);

      response.actions.forEach((action) => {
        expect(action.expiresAt).toBeNull();
        // Actions without expiration should never be EXPIRED
        expect(action.status).not.toBe("EXPIRED");
      });
    });

    it("should have consistent status and executed fields", async () => {
      const query = theGraphGraphql(
        `query {
          actions {
            id
            name
            status
            executed
            executedAt
          }
        }`
      );
      const response = await theGraphClient.request(query);

      response.actions.forEach((action) => {
        // Status and executed field should be consistent
        if (action.status === "EXECUTED") {
          expect(action.executed).toBe(true);
          expect(action.executedAt).toBeDefined();
        } else {
          expect(action.executed).toBe(false);
          expect(action.executedAt).toBeNull();
        }
      });
    });

    it("should have valid status transitions", async () => {
      const query = theGraphGraphql(
        `query {
          actions(orderBy: createdAt, orderDirection: desc) {
            id
            name
            status
            activeAt
            expiresAt
            createdAt
            executed
          }
        }`
      );
      const response = await theGraphClient.request(query);

      response.actions.forEach((action) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresAt = action.expiresAt ? parseInt(action.expiresAt) : null;

        // Validate status based on timing and execution - use the actual returned status
        // since the subgraph determines the correct status based on block timestamps
        if (action.executed) {
          expect(action.status).toBe("EXECUTED");
        } else if (expiresAt && currentTime > expiresAt) {
          expect(action.status).toBe("EXPIRED");
        } else {
          // For non-executed, non-expired actions, they can be either ACTIVE or PENDING
          // depending on the block timestamp vs activeAt comparison in the subgraph
          expect(["ACTIVE", "PENDING"]).toContain(action.status);
        }

        // Verify the status is one of the valid values
        expect(["PENDING", "ACTIVE", "EXECUTED", "EXPIRED"]).toContain(
          action.status
        );
      });
    });

    it("should have unique action IDs", async () => {
      const query = theGraphGraphql(
        `query {
          actions {
            id
            name
            target
            identifier
          }
        }`
      );
      const response = await theGraphClient.request(query);

      const actionIds = response.actions.map((action) => action.id);
      const uniqueIds = [...new Set(actionIds)];

      expect(actionIds.length).toBe(uniqueIds.length);
    });

    it("should handle actions with different identifier patterns", async () => {
      const query = theGraphGraphql(
        `query {
          approvalActions: actions(where: { name: "ApproveXvPSettlement" }) {
            id
            name
            target
            identifier
          }
          executionActions: actions(where: { name: "ExecuteXvPSettlement" }) {
            id
            name
            target
            identifier
          }
          bondActions: actions(where: { name: "MatureBond" }) {
            id
            name
            target
            identifier
          }
        }`
      );
      const response = await theGraphClient.request(query);

      // ApproveXvPSettlement should have participant address as identifier
      response.approvalActions.forEach((action) => {
        expect(action.identifier).toBeDefined();
        expect(action.identifier).not.toBe("null");
        expect(action.identifier).toMatch(/^0x[a-fA-F0-9]{40}$/); // Should be an address
      });

      // ExecuteXvPSettlement should have settlement address as identifier
      response.executionActions.forEach((action) => {
        expect(action.identifier).toBeDefined();
        expect(action.identifier).not.toBe("null");
        expect(action.identifier).toMatch(/^0x[a-fA-F0-9]{40}$/); // Should be an address
        expect(action.identifier).toBe(action.target); // Should match target
      });

      // MatureBond should have bond address as identifier
      response.bondActions.forEach((action) => {
        expect(action.identifier).toBeDefined();
        expect(action.identifier).not.toBe("null");
        expect(action.identifier).toMatch(/^0x[a-fA-F0-9]{40}$/); // Should be an address
        expect(action.identifier).toBe(action.target); // Should match target
      });
    });

    it("should have valid executor relationships", async () => {
      const query = theGraphGraphql(
        `query {
          actions {
            id
            name
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

      response.actions.forEach((action) => {
        expect(action.executor).toBeDefined();
        expect(action.executor.id).toBeDefined();
        expect(Array.isArray(action.executor.executors)).toBe(true);
        expect(action.executor.executors.length).toBeGreaterThan(0);

        // Verify bidirectional relationship
        expect(Array.isArray(action.executor.actions)).toBe(true);
        const actionIds = action.executor.actions.map((a) => a.id);
        expect(actionIds).toContain(action.id);

        // All executors should be valid addresses
        action.executor.executors.forEach((executor) => {
          expect(executor).toMatch(/^0x[a-fA-F0-9]{40}$/);
        });
      });
    });

    it("should handle actions without required roles", async () => {
      const query = theGraphGraphql(
        `query {
          actions(where: { requiredRole: null }) {
            id
            name
            requiredRole
            executor {
              executors
            }
          }
        }`
      );
      const response = await theGraphClient.request(query);

      expect(response.actions.length).toBeGreaterThan(0);

      response.actions.forEach((action) => {
        expect(action.requiredRole).toBeNull();
        expect(action.executor.executors.length).toBeGreaterThan(0);
      });
    });

    it("should filter actions by status correctly", async () => {
      const query = theGraphGraphql(
        `query {
          pendingActions: actions(where: { status: PENDING }) {
            id
            status
            executed
          }
          activeActions: actions(where: { status: ACTIVE }) {
            id
            status
            executed
          }
          executedActions: actions(where: { status: EXECUTED }) {
            id
            status
            executed
          }
          expiredActions: actions(where: { status: EXPIRED }) {
            id
            status
            executed
          }
        }`
      );
      const response = await theGraphClient.request(query);

      // Verify status filtering works correctly
      response.pendingActions.forEach((action) => {
        expect(action.status).toBe("PENDING");
        expect(action.executed).toBe(false);
      });

      response.activeActions.forEach((action) => {
        expect(action.status).toBe("ACTIVE");
        expect(action.executed).toBe(false);
      });

      response.executedActions.forEach((action) => {
        expect(action.status).toBe("EXECUTED");
        expect(action.executed).toBe(true);
      });

      response.expiredActions.forEach((action) => {
        expect(action.status).toBe("EXPIRED");
        expect(action.executed).toBe(false);
      });
    });

    it("should handle large numbers correctly", async () => {
      const query = theGraphGraphql(
        `query {
          actions {
            id
            createdAt
            activeAt
            expiresAt
            executedAt
          }
        }`
      );
      const response = await theGraphClient.request(query);

      response.actions.forEach((action) => {
        // All timestamps should be valid BigInt strings
        expect(action.createdAt).toMatch(/^\d+$/);
        expect(action.activeAt).toMatch(/^\d+$/);

        if (action.expiresAt) {
          expect(action.expiresAt).toMatch(/^\d+$/);
        }

        if (action.executedAt) {
          expect(action.executedAt).toMatch(/^\d+$/);
        }

        // Timestamps should be reasonable (not too old, not too far in future)
        // Note: Test data may contain future timestamps for testing purposes
        const createdAt = parseInt(action.createdAt);
        const now = Math.floor(Date.now() / 1000);
        const oneYearAgo = now - 365 * 24 * 60 * 60;
        const tenYearsFromNow = now + 10 * 365 * 24 * 60 * 60; // Allow up to 10 years for test data

        expect(createdAt).toBeGreaterThan(oneYearAgo);
        expect(createdAt).toBeLessThan(tenYearsFromNow);
      });
    });
  });
});
