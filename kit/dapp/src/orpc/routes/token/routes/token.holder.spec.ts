import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import type { Address } from "viem";
import { beforeAll, describe, expect, it } from "vitest";

describe("Token holder", () => {
  let testToken: Awaited<ReturnType<typeof createToken>>;
  let adminAddress: Address;
  let investorAddress: Address;

  beforeAll(async () => {
    // Create test token as admin
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    const adminClient = getOrpcClient(adminHeaders);

    testToken = await createToken(
      adminClient,
      {
        name: "Test Holder Token",
        symbol: "THT",
        decimals: 18,
        type: "stablecoin",
        countryCode: "056",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        grantRole: [
          "custodian",
          "governance",
          "supplyManagement",
          "emergency",
          "tokenManager",
        ],
        unpause: true,
      }
    );

    // Get user addresses for testing
    const adminUser = await getUserData(DEFAULT_ADMIN);
    adminAddress = adminUser.wallet;

    const investorUser = await getUserData(DEFAULT_INVESTOR);
    investorAddress = investorUser.wallet;

    // Mint some tokens to both admin and investor
    await adminClient.token.mint({
      contract: testToken.id,
      recipients: [adminAddress, investorAddress],
      amounts: [from("1000", 18), from("500", 18)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it("can read holder balance for admin", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: adminAddress,
    });

    expect(result.holder).toBeDefined();
    expect(result.holder?.account.id.toLowerCase()).toBe(
      adminAddress.toLowerCase()
    );
    expect(result.holder?.available).toEqual(from("1000", 18));
    expect(result.holder?.value).toEqual(from("1000", 18));
    expect(result.holder?.frozen).toEqual(from("0", 18));
    expect(result.holder?.isFrozen).toBe(false);
    expect(result.holder?.lastUpdatedAt).toBeInstanceOf(Date);
  });

  it("can read holder balance for investor", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: investorAddress,
    });

    expect(result.holder).toBeDefined();
    expect(result.holder?.account.id.toLowerCase()).toBe(
      investorAddress.toLowerCase()
    );
    expect(result.holder?.available).toEqual(from("500", 18));
    expect(result.holder?.value).toEqual(from("500", 18));
    expect(result.holder?.frozen).toEqual(from("0", 18));
    expect(result.holder?.isFrozen).toBe(false);
  });

  it("returns null for non-holder address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const nonHolderAddress = "0x0000000000000000000000000000000000000001";

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: nonHolderAddress,
    });

    expect(result.holder).toBeNull();
  });

  it("throws error for non-existent token", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const nonExistentToken = "0x0000000000000000000000000000000000000001";

    await expect(
      client.token.holder(
        {
          tokenAddress: nonExistentToken,
          holderAddress: adminAddress,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.THE_GRAPH_ERROR],
          },
        }
      )
    ).rejects.toThrow();
  });

  it("throws error for invalid token address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.holder(
        {
          tokenAddress: "invalid-address" as unknown as string,
          holderAddress: adminAddress,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED],
          },
        }
      )
    ).rejects.toThrow("Token address is not a valid Ethereum address");
  });

  it("throws error for invalid holder address", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    await expect(
      client.token.holder(
        {
          tokenAddress: testToken.id,
          holderAddress: "invalid-address" as unknown as string,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.INPUT_VALIDATION_FAILED],
          },
        }
      )
    ).rejects.toThrow("Holder address is not a valid Ethereum address");
  });

  it("handles case-insensitive addresses", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Test with uppercase address
    const upperCaseAddress = adminAddress.toUpperCase() as unknown as string;

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: upperCaseAddress,
    });

    expect(result.holder).toBeDefined();
    expect(result.holder?.available).toEqual(from("1000", 18));
  });

  it("investor can query their own balance", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: investorAddress,
    });

    expect(result.holder).toBeDefined();
    expect(result.holder?.available).toEqual(from("500", 18));
  });

  it("investor can query other holder balances if they have read permissions", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: adminAddress,
    });

    expect(result.holder).toBeDefined();
    expect(result.holder?.available).toEqual(from("1000", 18));
  });

  it("handles multiple consecutive reads", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Read the same holder multiple times
    const [result1, result2, result3] = await Promise.all([
      client.token.holder({
        tokenAddress: testToken.id,
        holderAddress: adminAddress,
      }),
      client.token.holder({
        tokenAddress: testToken.id,
        holderAddress: adminAddress,
      }),
      client.token.holder({
        tokenAddress: testToken.id,
        holderAddress: adminAddress,
      }),
    ]);

    // All reads should return the same data
    expect(result1.holder?.available).toEqual(result2.holder?.available);
    expect(result2.holder?.available).toEqual(result3.holder?.available);
    expect(result1.holder?.value).toEqual(result2.holder?.value);
    expect(result2.holder?.value).toEqual(result3.holder?.value);
  });

  it("returns detailed balance information", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: adminAddress,
    });

    // Verify all balance fields are present and correct
    expect(result.holder).toBeDefined();
    expect(result.holder?.account).toBeDefined();
    expect(result.holder?.available).toBeDefined();
    expect(result.holder?.frozen).toBeDefined();
    expect(result.holder?.isFrozen).toBeDefined();
    expect(result.holder?.value).toBeDefined();
    expect(result.holder?.lastUpdatedAt).toBeDefined();

    // Verify data types
    expect(typeof result.holder?.isFrozen).toBe("boolean");
    expect(result.holder?.lastUpdatedAt).toBeInstanceOf(Date);
  });
});
