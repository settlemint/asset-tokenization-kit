import { getTestAuthClient } from "@atk/auth/test/fixtures/auth-client";
import { setupUser, signInWithUser } from "@atk/auth/test/fixtures/user";
import { randomUUIDv7 } from "bun";
import { beforeAll, describe, expect, it } from "bun:test";

describe("Pincode verification", () => {
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

  it("can disable a pincode verification", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.pincode.disable(
      {
        password: TEST_USER.password,
      },
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.success).toBe(true);
  });

  it("can enable a pincode verification", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.pincode.enable(
      {
        pincode: "111111",
        password: TEST_USER.password,
      },
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.success).toBe(true);
  });

  it("can update a pincode verification", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.pincode.update(
      {
        newPincode: "222222",
        password: TEST_USER.password,
      },
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.success).toBe(true);
  });

  it("fails to update a pincode verification with the wrong password", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.pincode.update(
      {
        newPincode: "222222",
        password: "wrong-password",
      },
      {
        headers,
      }
    );
    expect(error?.code).toBe("INVALID_PASSWORD");
    expect(data).toBeNull();
  });
});
