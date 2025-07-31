import { beforeAll, describe, expect, it } from "vitest";
import { getOrpcClient } from "../utils/orpc-client";
import { createToken } from "../utils/token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token list", () => {
  let depositToken: Awaited<ReturnType<typeof createToken>>;
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    depositToken = await createToken(client, {
      name: "Deposit Token",
      symbol: `DT`,
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
    stablecoinToken = await createToken(client, {
      name: "Test Token",
      symbol: "TT",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
  });

  it("can list tokens", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const tokens = await client.token.list({});
    expect(tokens.length).toBeGreaterThanOrEqual(2);
    expect(tokens.find((t) => t.id === depositToken.id)).toBeDefined();
    expect(tokens.find((t) => t.id === stablecoinToken.id)).toBeDefined();
  });

  it("can list tokens by token factory", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const system = await client.system.read({ id: "default" });
    const depositTokenFactory = system.tokenFactories.find(
      (tokenFactory) => tokenFactory.typeId === "ATKDepositFactory"
    );
    expect(depositTokenFactory).toBeDefined();
    if (!depositTokenFactory) {
      throw new Error("Deposit token factory not found");
    }
    const tokens = await client.token.list({
      tokenFactory: depositTokenFactory.id,
    });
    expect(tokens.length).toBeGreaterThanOrEqual(1);
    expect(tokens.find((t) => t.id === depositToken.id)).toBeDefined();
    expect(tokens.find((t) => t.id === stablecoinToken.id)).toBeUndefined();
  });

  it("can list tokens by id", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const tokens = await client.token.list({
      searchByAddress: stablecoinToken.id,
    });
    expect(tokens.length).toBeGreaterThanOrEqual(1);
    expect(tokens.find((t) => t.id === stablecoinToken.id)).toBeDefined();
    expect(tokens.find((t) => t.id === depositToken.id)).toBeUndefined();
  });
});
