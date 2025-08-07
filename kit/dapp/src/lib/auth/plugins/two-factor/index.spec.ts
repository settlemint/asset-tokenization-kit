import { beforeAll, describe, expect, test } from "vitest";
import { randomUUID } from "node:crypto";
import { authClient } from "@test/fixtures/auth-client";
import { setupUser, signInWithUser } from "@test/fixtures/user";

describe("Two factor verification", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
    await setupUser(TEST_USER);
  });

  test("can enable two factor verification", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.twoFactor.enable(
      {
        password: TEST_USER.password,
      },
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.totpURI).toBeDefined();
    expect(data?.totpURI).toMatch(/^otpauth:\/\/totp/);
  });

  test("can disable two factor verification", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.twoFactor.disable(
      {
        password: TEST_USER.password,
      },
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.status).toBe(true);
  });
});
