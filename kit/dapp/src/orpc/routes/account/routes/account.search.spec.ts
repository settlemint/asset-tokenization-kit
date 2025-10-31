import { getOrpcClient, type OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe("Account search (integration)", () => {
  let client: OrpcClient;
  let token: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getOrpcClient(headers);

    token = await createToken(client, {
      name: "Searchable Token",
      symbol: "SRT",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      basePrice: from("1.00", 2),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it("finds the token account by address and returns contractName and displayName", async () => {
    const results = await client.account.search({ query: token.id, limit: 1 });
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe(token.id);
    expect(results[0]?.contractName).toBe(token.name);
    expect(results[0]?.displayName).toBe(token.name);
  });

  it("finds the admin user by wallet and returns contractName and displayName", async () => {
    const adminUser = await client.user.me();
    expect(adminUser).toBeDefined();
    expect(adminUser.wallet).toBeDefined();
    if (!adminUser.wallet) {
      throw new Error("Admin user wallet is not defined");
    }
    const results = await client.account.search({
      query: adminUser.wallet,
      limit: 1,
    });
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe(adminUser.wallet);
    expect(results[0]?.contractName).toBeUndefined();
    expect(results[0]?.displayName).toBe(adminUser.name);
  });

  it("finds the admin user by its identity and returns contractName and displayName", async () => {
    const adminUser = await client.user.me();
    expect(adminUser).toBeDefined();
    expect(adminUser.wallet).toBeDefined();
    if (!adminUser.wallet) {
      throw new Error("Admin user wallet is not defined");
    }
    const identity = await client.system.identity.readByWallet({
      wallet: adminUser.wallet,
    });
    expect(identity).toBeDefined();
    expect(identity.id).toBeDefined();
    if (!identity.id) {
      throw new Error("Identity is not defined");
    }
    const results = await client.account.search({
      query: identity.id,
      limit: 1,
    });
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe(identity.id);
    expect(results[0]?.contractName).toBe("Identity");
    expect(results[0]?.displayName).toBe(`${adminUser.name} (ONCHAINID)`);
  });
});
