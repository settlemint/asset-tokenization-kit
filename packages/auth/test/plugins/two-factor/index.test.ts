import { beforeAll, describe, expect, it } from "bun:test";
import { getTestAuthClient } from "@atk/auth/test/fixtures/auth-client";
import { setupUser, signInWithUser } from "@atk/auth/test/fixtures/user";
import { randomUUIDv7 } from "bun";

describe("Two factor verification", () => {
  let authClient: ReturnType<typeof getTestAuthClient>;

  const TEST_USER = {
    email: `${randomUUIDv7()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
    authClient = getTestAuthClient();
    await setupUser(TEST_USER);
  });

  it("can enable two factor verification", async () => {
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

  it("can disable two factor verification", async () => {
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
