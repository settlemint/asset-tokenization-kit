import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  createTestUser,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, test } from "vitest";

describe("Identity create", () => {
  test("a user can create its own identity", async () => {
    const { user } = await createTestUser();

    const headers = await signInWithUser(user);
    const client = getOrpcClient(headers);

    const result = await client.system.identityCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
    });
    expect(result.id).toBeDefined();
    expect(result.identity).toBeDefined();
  });

  test("investor cannot create an identity for another user", async () => {
    const {
      session: { wallet },
    } = await createTestUser();

    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);

    await expect(
      client.system.identityCreate({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        wallet,
      })
    ).rejects.toThrow("Forbidden");
  });

  test("admin can create an identity for another user", async () => {
    const {
      session: { wallet },
    } = await createTestUser();

    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.identityCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      wallet,
    });
    expect(result.id).toBeDefined();
    expect(result.identity).toBeDefined();
  });
});
