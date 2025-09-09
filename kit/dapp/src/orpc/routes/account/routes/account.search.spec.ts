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

  it("finds the token account by address and returns contractName", async () => {
    const results = await client.account.search({ query: token.id, limit: 1 });
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe(token.id);
    expect(results[0]?.contractName).toBeDefined();
  });
});
