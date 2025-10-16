import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("XVP Settlements", () => {
  it("should fetch a list of all XVP settlements", async () => {
    const query = theGraphGraphql(
      `query {
        xvPSettlements(orderBy: createdAt, orderDirection: asc) {
          id
          cutoffDate
          autoExecute
          executed
          cancelled
          hashlock
          hasExternalFlows
          secretRevealed
          secret
          secretRevealedAt
          secretRevealTx
          secretRevealedBy {
            id
          }
          createdAt
          flows {
            id
            asset {
              id
              symbol
              name
            }
            assetReference {
              id
              chainId
              address
              token {
                id
              }
            }
            from {
              id
            }
            to {
              id
            }
            amount
            amountExact
            externalChainId
            isExternal
          }
          approvals {
            id
            account {
              id
            }
            approved
            timestamp
          }
          cancelVotes {
            id
            account {
              id
            }
            active
            votedAt
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Verify we have at least one XVP settlement from the hardhat script
    expect(response.xvPSettlements.length).toBeGreaterThanOrEqual(1);

    // Get the first settlement
    const settlement = response.xvPSettlements[0];

    // Verify settlement structure
    expect(settlement?.id).toBeDefined();
    expect(settlement?.executed).toBe(false); // Should not be executed by default
    expect(settlement?.cancelled).toBe(false);
    expect(settlement?.autoExecute).toBe(false); // Script sets this to false
    expect(settlement?.hasExternalFlows).toBe(false);
    expect(settlement?.secretRevealed).toBe(false);
    expect(settlement?.secret).toBeNull();
    expect(settlement?.secretRevealedAt).toBeNull();
    expect(settlement?.secretRevealTx).toBeNull();
    expect(settlement?.secretRevealedBy).toBeNull();

    // Derive participants from flows (unique from/to addresses)
    const participantAddresses = new Set();
    settlement?.flows.forEach((flow) => {
      participantAddresses.add(flow.from.id);
      participantAddresses.add(flow.to.id);
    });
    expect(participantAddresses.size).toBe(2); // Two participants in the swap

    expect(settlement?.flows.length).toBe(2); // Two flows (bidirectional)
    expect(settlement?.approvals.length).toBe(2); // Approvals should be created for both participants

    // Verify flows structure
    settlement?.flows.forEach((flow) => {
      expect(flow.assetReference).toBeDefined();
      expect(flow.assetReference.chainId).toBeDefined();
      expect(flow.assetReference.address).toBeDefined();
      if (flow.isExternal) {
        expect(flow.asset).toBeNull();
        expect(flow.assetReference.token).toBeNull();
      } else {
        expect(flow.asset).toBeDefined();
        expect(flow.asset.symbol).toBeDefined();
        expect(flow.assetReference.token?.id).toBeDefined();
      }
      expect(flow.from.id).toBeDefined();
      expect(flow.to.id).toBeDefined();
      expect(flow.amount).toBeDefined();
      expect(flow.amountExact).toBeDefined();
      expect(typeof flow.isExternal).toBe("boolean");
      expect(flow.externalChainId).toBeDefined();
    });

    expect(Array.isArray(settlement?.cancelVotes)).toBe(true);
    expect(settlement?.hashlock).toBeDefined();
    expect(typeof settlement?.hasExternalFlows).toBe("boolean");
    expect(typeof settlement?.secretRevealed).toBe("boolean");
    expect(settlement?.secretRevealedBy === null || typeof settlement?.secretRevealedBy.id === "string").toBe(true);
    settlement?.cancelVotes.forEach((vote) => {
      expect(vote.account.id).toBeDefined();
      expect(typeof vote.active).toBe("boolean");
    });
    // Verify approvals structure - different scenarios may have different approval states
    settlement?.approvals.forEach((approval) => {
      expect(approval.account.id).toBeDefined();
      expect(typeof approval.approved).toBe("boolean"); // Can be true or false depending on scenario
      // If approved, should have timestamp; if not approved, should be null
      if (approval.approved) {
        expect(approval.timestamp).toBeDefined();
      } else {
        expect(approval.timestamp).toBeNull();
      }
    });
  });

  it("should fetch XVP settlement creation events", async () => {
    const query = theGraphGraphql(
      `query {
        events(
          where: {
            eventName: "XvPSettlementCreated"
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

    // Should have at least 1 creation event
    expect(response.events.length).toBeGreaterThanOrEqual(1);

    const events = response.events;

    // Verify event structure
    events.forEach((event) => {
      expect(event.id).toBeDefined();
      expect(event.eventName).toBe("XvPSettlementCreated");
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
          assetReference {
            id
            chainId
            address
            token {
              id
            }
          }
          from {
            id
          }
          to {
            id
          }
          amount
          amountExact
          externalChainId
          isExternal
          xvpSettlement {
            id
            executed
          }
        }
      }`
    );
    const response = await theGraphClient.request(query);

    // Should have at least 2 flows from our settlement
    expect(response.xvPSettlementFlows.length).toBeGreaterThanOrEqual(2);

    const flows = response.xvPSettlementFlows;

    // Verify flow structure and relationships
    flows.forEach((flow) => {
      expect(flow.id).toBeDefined();
      expect(flow.assetReference).toBeDefined();
      if (flow.isExternal) {
        expect(flow.asset).toBeNull();
        expect(flow.assetReference.token).toBeNull();
      } else {
        expect(flow.asset?.id).toBeDefined();
        expect(flow.asset?.symbol).toBeDefined();
        expect(flow.asset?.type).toBeDefined();
        expect(flow.assetReference.token?.id).toBeDefined();
      }
      expect(flow.from.id).toBeDefined();
      expect(flow.to.id).toBeDefined();
      expect(flow.amount).toBeDefined();
      expect(flow.amountExact).toBeDefined();
      expect(flow.xvpSettlement.id).toBeDefined();
      expect(flow.xvpSettlement.executed).toBe(false); // Not executed initially
    });

    // The flows should represent our expected asset types from the script
    const assetTypes = flows.filter((flow) => !flow.isExternal).map((flow) => flow.asset?.type);
    expect(assetTypes).toContain("stablecoin");
    expect(assetTypes).toContain("equity");
  });
});
