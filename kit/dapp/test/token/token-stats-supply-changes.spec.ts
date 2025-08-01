import { beforeAll, describe, expect, it, beforeEach } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";
import { theGraphClient } from "../the-graph-mocks";

describe("Token stats supply changes", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    testToken = await createToken(client, {
      name: "Test Token",
      symbol: "TST",
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
  });

  beforeEach(() => {
    theGraphClient.query.mockReset();
  });

  it("can fetch supply changes history for a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock TheGraph response
    const mockGraphResponse = {
      tokenSupplyChanges_collection: [
        {
          timestamp: "1672531200", // 2023-01-01
          totalMinted: "1000000000000000000000", // 1000 tokens
          totalBurned: "100000000000000000000", // 100 tokens
        },
        {
          timestamp: "1672617600", // 2023-01-02
          totalMinted: "1500000000000000000000", // 1500 tokens
          totalBurned: "200000000000000000000", // 200 tokens
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsSupplyChanges({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.supplyChangesHistory).toHaveLength(2);
    expect(result.supplyChangesHistory[0]).toMatchObject({
      timestamp: 1672531200,
      totalMinted: "1000000000000000000000",
      totalBurned: "100000000000000000000",
    });
  });

  it("rejects invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.statsSupplyChanges({
        tokenAddress: "invalid-address",
        days: 30,
      })
    ).rejects.toThrow();
  });

  it("rejects days parameter out of range", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Too small
    await expect(
      client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 0,
      })
    ).rejects.toThrow();

    // Too large
    await expect(
      client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 400,
      })
    ).rejects.toThrow();
  });

  it("uses default days value when not specified", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const mockGraphResponse = {
      tokenSupplyChanges_collection: [
        {
          timestamp: "1672531200",
          totalMinted: "1000000000000000000000",
          totalBurned: "100000000000000000000",
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsSupplyChanges({
      tokenAddress: testToken.id,
      // days not specified - should default to 30
    });

    expect(result.supplyChangesHistory).toHaveLength(1);
    expect(theGraphClient.query).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          tokenId: testToken.id.toLowerCase(),
        }),
      })
    );
  });

  it("handles empty data response gracefully", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock empty response
    const mockGraphResponse = {
      tokenSupplyChanges_collection: [],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsSupplyChanges({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.supplyChangesHistory).toHaveLength(0);
    expect(result.supplyChangesHistory).toEqual([]);
  });

  it("handles TheGraph service failure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock service failure
    theGraphClient.query.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      client.token.statsSupplyChanges({
        tokenAddress: testToken.id,
        days: 30,
      })
    ).rejects.toThrow("Network error");
  });
});
