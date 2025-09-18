import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, test } from "vitest";

describe("Identity create", () => {
  test("a user can create its own identity", async () => {
    const {
      user,
      session: { wallet },
    } = await createTestUser();
    const headers = await signInWithUser(user);
    const client = getOrpcClient(headers);

    const result = await client.system.identity.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    expect(result.account).toBe(wallet);
    expect(result.id).toBeDefined();
  });

  test("investor cannot create an identity for another user", async () => {
    const [
      {
        session: { wallet },
      },
      headers,
    ] = await Promise.all([createTestUser(), signInWithUser(DEFAULT_INVESTOR)]);
    const client = getOrpcClient(headers);

    await expect(
      client.system.identity.create(
        {
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          wallet,
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
  });

  test("admin can create an identity for another user", async () => {
    const [
      {
        session: { wallet },
      },
      headers,
    ] = await Promise.all([createTestUser(), signInWithUser(DEFAULT_ADMIN)]);
    const client = getOrpcClient(headers);

    const result = await client.system.identity.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      wallet,
    });
    expect(result.id).toBeDefined();
    expect(result.account).toBe(wallet);

    const initialUser = await client.system.identity.search({
      account: wallet,
    });
    expect(initialUser?.registered).toBeUndefined();
  });
});
