import { beforeAll, describe, expect, it } from "bun:test";
import { getTestAuthClient } from "@atk/auth/test/fixtures/auth-client";
import { setupUser, signInWithUser } from "@atk/auth/test/fixtures/user";
import { randomUUIDv7 } from "bun";

describe("Secret codes verification", () => {
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

  it("can generate secret codes", async () => {
    const { data, error } = await authClient.secretCodes.generate(
      {
        password: TEST_USER.password,
      },
      {
        headers: await signInWithUser(TEST_USER),
      }
    );
    expect(error).toBeNull();
    expect(data?.secretCodes).toBeDefined();
    expect(data?.secretCodes?.length).toBe(16);
  });

  it("fails to generate secret codes with the wrong password", async () => {
    const { data, error } = await authClient.secretCodes.generate(
      {
        password: "wrong-password",
      },
      {
        headers: await signInWithUser(TEST_USER),
      }
    );
    expect(error?.code).toBe("INVALID_PASSWORD");
    expect(data).toBeNull();
  });
});
