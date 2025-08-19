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
    const wallet = await createUserWithIdentity();

    const headers = await signInWithUser(DEFAULT_INVESTOR);
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
    const wallet = await createUserWithIdentity();

    const headers = await signInWithUser(DEFAULT_ADMIN);
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
  }, 6000);
});

async function createUserWithIdentity() {
  const {
    session: { wallet },
  } = await createTestUser();

  const headers = await signInWithUser(DEFAULT_ADMIN);
  const client = getOrpcClient(headers);

  await client.system.identityCreate({
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    wallet,
  });
  return wallet;
}
