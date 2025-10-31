import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, test } from "vitest";

describe("Identity register", () => {
  let wallet1: string;
  let wallet2: string;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    [wallet1, wallet2] = await Promise.all([
      createUserWithIdentity(headers),
      createUserWithIdentity(headers),
    ]);
  }, 100_000);

  test("investor cannot register an identity", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.system.identity.register(
        {
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          country: "BE",
          wallet: wallet1,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  }, 10_000);

  test("admin can register an identity for another user", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const preRegistrationIdentity = await client.system.identity.readByWallet({
      wallet: wallet2,
    });
    expect(preRegistrationIdentity.registered).toBeUndefined();

    const result = await client.system.identity.register({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      country: "BE",
      wallet: wallet2,
    });
    expect(result.account.id).toBe(wallet2);

    const postRegistrationIdentity = await client.system.identity.readByWallet({
      wallet: wallet2,
    });
    expect(postRegistrationIdentity.registered).toEqual({
      isRegistered: true,
      country: "BE",
    });
  }, 10_000);
});

async function createUserWithIdentity(adminHeaders: Headers) {
  const {
    session: { wallet },
  } = await createTestUser();
  const client = getOrpcClient(adminHeaders);

  await client.system.identity.create({
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    wallet,
  });
  return wallet;
}
