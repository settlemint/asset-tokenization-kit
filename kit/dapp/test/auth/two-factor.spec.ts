import { beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { authClient } from "../utils/auth-client";
import { setupUser, signInWithUser } from "../utils/user";

describe("Two factor verification", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
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
