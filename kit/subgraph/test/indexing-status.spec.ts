import { describe, expect, it } from "bun:test";
import { theGraphClient, theGraphGraphql } from "./utils/thegraph-client";

describe("Indexing status", () => {
  it("should have finished indexing without errors", async () => {
    const query = theGraphGraphql(`
      query {
        _meta {
          hasIndexingErrors
          block {
            number
          }
        }
      }
    `);
    const response = await theGraphClient.request(query);
    expect(response._meta?.hasIndexingErrors).toBe(false);
    expect(response._meta?.block.number).toBeGreaterThanOrEqual(50);
  });
});
