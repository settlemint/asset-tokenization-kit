import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { authClient, setupUser, signInWithUser } from "../utils/auth-client";

describe("Secret codes verification", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
    await setupUser(TEST_USER);
  });

  it("can generate secret codes without", async () => {
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
