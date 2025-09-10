import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

describe("Custodian Extension", () => {
  describe("Freeze/Unfreeze Events", () => {
    it("should fetch freeze partial tokens events", async () => {
      const query = theGraphGraphql(
        `query($where: Event_filter) {
          events(where: $where, orderBy: blockNumber) {
            id
            blockNumber
            eventName
            transactionHash
            involved {
              id
            }
          }
        }`
      );

      const response = await theGraphClient.request(query, {
        where: {
          eventName: "FreezePartialTokens",
        },
      });

      // Test passes if no error is thrown - event structure is valid
      expect(Array.isArray((response as any).events)).toBe(true);
    });

    it("should fetch unfreeze partial tokens events", async () => {
      const query = theGraphGraphql(
        `query($where: Event_filter) {
          events(where: $where, orderBy: blockNumber) {
            id
            blockNumber
            eventName
            transactionHash
            involved {
              id
            }
          }
        }`
      );

      const response = await theGraphClient.request(query, {
        where: {
          eventName: "UnfreezePartialTokens",
        },
      });

      // Test passes if no error is thrown - event structure is valid
      expect(Array.isArray((response as any).events)).toBe(true);
    });

    it("should fetch set address frozen events", async () => {
      const query = theGraphGraphql(
        `query($where: Event_filter) {
          events(where: $where, orderBy: blockNumber) {
            id
            blockNumber
            eventName
            transactionHash
            involved {
              id
            }
          }
        }`
      );

      const response = await theGraphClient.request(query, {
        where: {
          eventName: "SetAddressFrozen",
        },
      });

      // Test passes if no error is thrown - event structure is valid
      expect(Array.isArray((response as any).events)).toBe(true);
    });
  });

  describe("Role Management", () => {
    it("should track freezer role assignments", async () => {
      const query = theGraphGraphql(
        `query {
          tokens(first: 5) {
            id
            symbol
            freezer {
              id
            }
          }
        }`
      );

      const response = await theGraphClient.request(query, {});

      // Should return tokens array without errors
      expect(Array.isArray((response as any).tokens)).toBe(true);
    });

    it("should track custodian role assignments", async () => {
      const query = theGraphGraphql(
        `query {
          tokens(first: 5) {
            id
            symbol
            custodian {
              id
            }
          }
        }`
      );

      const response = await theGraphClient.request(query, {});

      // Should return tokens array without errors
      expect(Array.isArray((response as any).tokens)).toBe(true);
    });

    it("should track emergency role assignments", async () => {
      const query = theGraphGraphql(
        `query {
          tokens(first: 5) {
            id
            symbol
            emergency {
              id
            }
          }
        }`
      );

      const response = await theGraphClient.request(query, {});

      // Should return tokens array without errors
      expect(Array.isArray((response as any).tokens)).toBe(true);
    });
  });
});
