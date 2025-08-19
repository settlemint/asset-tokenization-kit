import { getAuthClient } from "@test/fixtures/auth-client";
import { createTestUser, signInWithUser } from "@test/fixtures/user";
import { beforeAll, describe, expect, test } from "vitest";

describe("Secret codes verification", () => {
  let authClient: ReturnType<typeof getAuthClient>;
  let testUser: Awaited<ReturnType<typeof createTestUser>>["user"];

  beforeAll(async () => {
    authClient = getAuthClient();
    const { user } = await createTestUser();
    testUser = user;
  });

  test("can generate secret codes", async () => {
    const { data, error } = await authClient.secretCodes.generate(
      {
        password: testUser.password,
      },
      {
        headers: await signInWithUser(testUser, true),
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
        headers: await signInWithUser(testUser, true),
      }
    );
    expect(error?.code).toBe("INVALID_PASSWORD");
    expect(data).toBeNull();
  });
});
