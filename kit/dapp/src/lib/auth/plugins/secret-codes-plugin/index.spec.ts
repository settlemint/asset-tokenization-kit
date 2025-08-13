import { getAuthClient } from "@test/fixtures/auth-client";
import { setupUser, signInWithUser } from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, test } from "vitest";

describe("Secret codes verification", () => {
  let authClient: ReturnType<typeof getAuthClient>;

  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
    authClient = getAuthClient();
    await setupUser(TEST_USER);
  });

  test("can generate secret codes", async () => {
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

  test("fails to generate secret codes with the wrong password", async () => {
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
