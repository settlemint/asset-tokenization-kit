import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, test } from "vitest";

describe("Identity register", () => {
  let walletAddress: string;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    walletAddress = await createUserWithIdentity(headers);
  }, 20_000);

  test("investor cannot register an identity", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.system.identityRegister({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        country: "BE",
        wallet: walletAddress,
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action."
    );
  }, 10_000);

  test("admin can register an identity for another user", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.identityRegister({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      country: "BE",
      wallet: walletAddress,
    });
    expect(result.id).toBe(walletAddress);
    expect(result.identity).toBeDefined();
    expect(result.country).toBe("BE");
  }, 10_000);
});

async function createUserWithIdentity(adminHeaders: Headers) {
  const {
    session: { wallet },
  } = await createTestUser();
  const client = getOrpcClient(adminHeaders);

  await client.system.identityCreate({
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    wallet,
  });
  return wallet;
}
