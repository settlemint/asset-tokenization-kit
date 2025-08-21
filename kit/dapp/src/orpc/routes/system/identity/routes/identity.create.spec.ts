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

    const result = await client.system.identityCreate({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    expect(result.id).toBe(wallet);
    expect(result.identity).toBeDefined();
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
      client.system.identityCreate(
        {
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          wallet,
        },
        {
          context: {
            expectErrors: [CUSTOM_ERROR_CODES.FORBIDDEN],
          },
        }
      )
    ).rejects.toThrow(errorMessageForCode(CUSTOM_ERROR_CODES.FORBIDDEN));
  });

  test("admin can create an identity for another user", async () => {
    const [
      {
        session: { wallet },
      },
      headers,
    ] = await Promise.all([createTestUser(), signInWithUser(DEFAULT_ADMIN)]);
    const client = getOrpcClient(headers);

    const result = await client.system.identityCreate({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      wallet,
    });
    expect(result.id).toBe(wallet);
    expect(result.identity).toBeDefined();
  });
});
