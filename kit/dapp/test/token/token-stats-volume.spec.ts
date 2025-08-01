import { beforeAll, describe, expect, it, beforeEach } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";
import { theGraphClient } from "../the-graph-mocks";

describe("Token stats volume", () => {
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

  it("can fetch volume history for a token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock TheGraph response
    const mockGraphResponse = {
      tokenStats_collection: [
        {
          timestamp: "1672531200", // 2023-01-01
          totalTransferred: "5000000000000000000000", // 5000 tokens
        },
        {
          timestamp: "1672617600", // 2023-01-02
          totalTransferred: "7500000000000000000000", // 7500 tokens
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsVolume({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.volumeHistory).toHaveLength(2);
    expect(result.volumeHistory[0]).toMatchObject({
      timestamp: 1672531200,
      totalVolume: "5000000000000000000000",
    });
    expect(result.volumeHistory[1]).toMatchObject({
      timestamp: 1672617600,
      totalVolume: "7500000000000000000000",
    });
  });

  it("rejects invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.statsVolume({
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
      client.token.statsVolume({
        tokenAddress: testToken.id,
        days: 0,
      })
    ).rejects.toThrow();

    // Too large
    await expect(
      client.token.statsVolume({
        tokenAddress: testToken.id,
        days: 400,
      })
    ).rejects.toThrow();
  });

  it("uses default days value when not specified", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const mockGraphResponse = {
      tokenStats_collection: [
        {
          timestamp: "1672531200",
          totalTransferred: "1000000000000000000000",
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsVolume({
      tokenAddress: testToken.id,
      // days not specified - should default to 30
    });

    expect(result.volumeHistory).toHaveLength(1);
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

    // Mock empty response - no volume data
    const mockGraphResponse = {
      tokenStats_collection: [],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsVolume({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.volumeHistory).toHaveLength(0);
    expect(result.volumeHistory).toEqual([]);
  });

  it("handles zero volume data correctly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock response with zero volume
    const mockGraphResponse = {
      tokenStats_collection: [
        {
          timestamp: "1672531200",
          totalTransferred: "0", // No volume
        },
        {
          timestamp: "1672617600",
          totalTransferred: "0", // No volume
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsVolume({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.volumeHistory).toHaveLength(2);
    expect(result.volumeHistory[0]?.totalVolume).toBe("0");
    expect(result.volumeHistory[1]?.totalVolume).toBe("0");
  });

  it("handles large volume numbers correctly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock response with very large volume
    const mockGraphResponse = {
      tokenStats_collection: [
        {
          timestamp: "1672531200",
          totalTransferred: "999999999999999999999999999999", // Very large volume
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsVolume({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.volumeHistory).toHaveLength(1);
    expect(result.volumeHistory[0]?.totalVolume).toBe(
      "999999999999999999999999999999"
    );
    expect(typeof result.volumeHistory[0]?.totalVolume).toBe("string");
  });

  it("processes timestamp conversion correctly", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const mockGraphResponse = {
      tokenStats_collection: [
        {
          timestamp: "1672531200", // String timestamp
          totalTransferred: "1000000000000000000000",
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsVolume({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.volumeHistory[0]?.timestamp).toBe(1672531200);
    expect(typeof result.volumeHistory[0]?.timestamp).toBe("number");
  });

  it("maintains data ordering by timestamp", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const mockGraphResponse = {
      tokenStats_collection: [
        {
          timestamp: "1672531200", // Earlier timestamp
          totalTransferred: "1000000000000000000000",
        },
        {
          timestamp: "1672617600", // Later timestamp
          totalTransferred: "2000000000000000000000",
        },
        {
          timestamp: "1672704000", // Latest timestamp
          totalTransferred: "3000000000000000000000",
        },
      ],
    };

    theGraphClient.query.mockResolvedValueOnce(mockGraphResponse);

    const result = await client.token.statsVolume({
      tokenAddress: testToken.id,
      days: 30,
    });

    expect(result.volumeHistory).toHaveLength(3);
    expect(result.volumeHistory[0]?.timestamp).toBeLessThan(
      result.volumeHistory[1]?.timestamp!
    );
    expect(result.volumeHistory[1]?.timestamp).toBeLessThan(
      result.volumeHistory[2]?.timestamp!
    );
  });

  it("handles TheGraph service failure", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Mock service failure
    theGraphClient.query.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      client.token.statsVolume({
        tokenAddress: testToken.id,
        days: 30,
      })
    ).rejects.toThrow("Network error");
  });
});
