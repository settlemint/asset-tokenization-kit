import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";

describe("Token list", () => {
  let depositToken: Awaited<ReturnType<typeof createToken>>;
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);
    depositToken = await createToken(client, {
      name: "Deposit Token",
      symbol: "DT",
      decimals: 18,
      type: "deposit",
      countryCode: "056",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    stablecoinToken = await createToken(client, {
      name: "Test Token",
      symbol: "TT",
      decimals: 18,
      type: "stablecoin",
      countryCode: "056",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  it("can list tokens", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);
    const tokens = await client.token.list({});
    expect(tokens.length).toBeGreaterThanOrEqual(2);
    expect(tokens.find((t) => t.id === depositToken.id)).toBeDefined();
    expect(tokens.find((t) => t.id === stablecoinToken.id)).toBeDefined();
  });

  it("can list tokens by token factory", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);
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
});
