import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, test } from "vitest";

describe("Identity register", () => {
  test("investor cannot register an identity", async () => {
    const [headers, adminHeaders] = await Promise.all([
      signInWithUser(DEFAULT_INVESTOR),
      signInWithUser(DEFAULT_ADMIN),
    ]);
    const wallet = await createUserWithIdentity(adminHeaders);
    const client = getOrpcClient(headers);

    await expect(
      client.system.identityRegister({
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        country: "BE",
        wallet,
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action."
    );
  });

  test("admin can register an identity for another user", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const wallet = await createUserWithIdentity(headers);
    const client = getOrpcClient(headers);

    const result = await client.system.identityRegister({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      country: "BE",
      wallet,
    });
    expect(result.id).toBe(wallet);
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
