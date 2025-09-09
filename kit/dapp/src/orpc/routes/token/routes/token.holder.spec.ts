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
import { eq, from } from "dnum";
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
        type: "deposit",
        countryCode: "056",
        basePrice: from("1.00", 2),
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
      amounts: [from(1000, 18), from(500, 18)],
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
    expect(
      result.holder?.available && eq(result.holder.available, from(1000))
    ).toBe(true);
    expect(result.holder?.value && eq(result.holder.value, from(1000))).toBe(
      true
    );
    expect(result.holder?.frozen && eq(result.holder.frozen, from(0))).toBe(
      true
    );
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
    expect(
      result.holder?.available && eq(result.holder.available, from(500))
    ).toBe(true);
    expect(result.holder?.value && eq(result.holder.value, from(500))).toBe(
      true
    );
    expect(result.holder?.frozen && eq(result.holder.frozen, from(0))).toBe(
      true
    );
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

  it("investor can query their own balance", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: investorAddress,
    });

    expect(result.holder).toBeDefined();
    expect(
      result.holder?.available && eq(result.holder.available, from(500))
    ).toBe(true);
  });

  it("investor can query other holder balances if they have read permissions", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    const result = await client.token.holder({
      tokenAddress: testToken.id,
      holderAddress: adminAddress,
    });

    expect(result.holder).toBeDefined();
    expect(
      result.holder?.available && eq(result.holder.available, from(1000))
    ).toBe(true);
  });
});
