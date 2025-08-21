import { getAuthClient } from "@test/fixtures/auth-client";
import { createTestUser, signInWithUser } from "@test/fixtures/user";
import { beforeAll, describe, expect, test } from "vitest";

describe("Two factor verification", () => {
  let authClient: ReturnType<typeof getAuthClient>;
  let testUser: Awaited<ReturnType<typeof createTestUser>>["user"];

  beforeAll(async () => {
    authClient = getAuthClient();
    const { user } = await createTestUser();
    testUser = user;
  });

  test("can enable two factor verification", async () => {
    const headers = await signInWithUser(testUser, true);
    const { data, error } = await authClient.twoFactor.enable(
      {},
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.totpURI).toBeDefined();
    expect(data?.totpURI).toMatch(/^otpauth:\/\/totp/);
  });

  test("can disable two factor verification", async () => {
    const headers = await signInWithUser(testUser, true);
    const { data, error } = await authClient.twoFactor.disable(
      {},
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.status).toBe(true);
  });
});
