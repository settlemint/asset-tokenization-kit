import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("XVP Settlements", () => {
  it("should fetch a list of all XVP settlements", async () => {
    const query = theGraphGraphql(
      `query {
        xvPSettlements(orderBy: createdAt, orderDirection: desc) {
          id
          cutoffDate
          autoExecute
          executed
          cancelled
          createdAt
          participants
          flows {
            id
            asset {
              id
              symbol
              name
            }
            from {
              id
            }
            to {
              id
            }
            amount
            amountExact
          }
          approvals {
            id
            account {
              id
            }
            approved
            timestamp
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Verify we have at least one XVP settlement from the hardhat script
    expect((response as any).xvPSettlements.length).toBeGreaterThanOrEqual(1);

    const settlement = (response as any).xvPSettlements[0];

    // Verify settlement structure
    expect(settlement.id).toBeDefined();
    expect(settlement.executed).toBe(true); // Should be executed by the script
    expect(settlement.cancelled).toBe(false);
    expect(settlement.autoExecute).toBe(false); // Script sets this to false
    expect(settlement.participants.length).toBe(2); // Two participants in the swap
    expect(settlement.flows.length).toBe(2); // Two flows (bidirectional)
    expect(settlement.approvals.length).toBe(2); // Both participants should have approved

    // Verify flows structure
    settlement.flows.forEach((flow: any) => {
      expect(flow.asset).toBeDefined();
      expect(flow.asset.symbol).toBeDefined();
      expect(flow.from.id).toBeDefined();
      expect(flow.to.id).toBeDefined();
      expect(flow.amount).toBeDefined();
      expect(flow.amountExact).toBeDefined();
    });

    // Verify approvals structure
    settlement.approvals.forEach((approval: any) => {
      expect(approval.account.id).toBeDefined();
      expect(approval.approved).toBe(true); // All approvals should be true
      expect(approval.timestamp).toBeDefined();
    });
  });

  it("should fetch XVP settlement events", async () => {
    const query = theGraphGraphql(
      `query {
        events(
          where: {
            eventName_in: [
              "XvPSettlementApproved",
              "XvPSettlementExecuted",
              "XvPSettlementCancelled",
              "XvPSettlementApprovalRevoked"
            ]
          },
          orderBy: blockTimestamp,
          orderDirection: desc
        ) {
          id
          eventName
          blockNumber
          blockTimestamp
          transactionHash
          emitter {
            id
          }
          sender {
            id
          }
          involved {
            id
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have at least 3 events: 2 approvals + 1 execution
    expect((response as any).events.length).toBeGreaterThanOrEqual(3);

    const events = (response as any).events;

    // Verify we have the expected event types
    const approvalEvents = events.filter(
      (e: any) => e.eventName === "XvPSettlementApproved"
    );
    const executionEvents = events.filter(
      (e: any) => e.eventName === "XvPSettlementExecuted"
    );

    expect(approvalEvents.length).toBeGreaterThanOrEqual(2); // At least 2 approvals
    expect(executionEvents.length).toBeGreaterThanOrEqual(1); // At least 1 execution

    // Verify event structure
    events.forEach((event: any) => {
      expect(event.id).toBeDefined();
      expect(event.eventName).toBeDefined();
      expect(event.blockNumber).toBeDefined();
      expect(event.blockTimestamp).toBeDefined();
      expect(event.transactionHash).toBeDefined();
      expect(event.emitter.id).toBeDefined();
      expect(event.sender.id).toBeDefined();
      expect(Array.isArray(event.involved)).toBe(true);
    });
  });

  it("should have proper flow asset relationships", async () => {
    const query = theGraphGraphql(
      `query {
        xvPSettlementFlows(orderBy: amount, orderDirection: desc) {
          id
          asset {
            id
            symbol
            name
            type
          }
          from {
            id
          }
          to {
            id
          }
          amount
          amountExact
          xvpSettlement {
            id
            executed
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have at least 2 flows from our settlement
    expect((response as any).xvPSettlementFlows.length).toBeGreaterThanOrEqual(
      2
    );

    const flows = (response as any).xvPSettlementFlows;

    // Verify flow structure and relationships
    flows.forEach((flow: any) => {
      expect(flow.id).toBeDefined();
      expect(flow.asset.id).toBeDefined();
      expect(flow.asset.symbol).toBeDefined();
      expect(flow.asset.type).toBeDefined();
      expect(flow.from.id).toBeDefined();
      expect(flow.to.id).toBeDefined();
      expect(flow.amount).toBeDefined();
      expect(flow.amountExact).toBeDefined();
      expect(flow.xvpSettlement.id).toBeDefined();
      expect(flow.xvpSettlement.executed).toBe(true);
    });

    // The flows should represent our expected asset types from the script
    const assetTypes = flows.map((flow: any) => flow.asset.type);
    expect(assetTypes).toContain("stablecoin");
    expect(assetTypes).toContain("equity");
  });
});
