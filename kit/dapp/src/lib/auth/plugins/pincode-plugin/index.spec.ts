import { getAuthClient } from "@test/fixtures/auth-client";
import { setupUser, signInWithUser } from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, test } from "vitest";

describe("Pincode verification", () => {
  const authClient = getAuthClient();

  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
    await setupUser(TEST_USER);
  });

  test("can disable a pincode verification", async () => {
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

  test("can enable a pincode verification", async () => {
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

  test("can update a pincode verification", async () => {
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

  test("fails to update a pincode verification with the wrong password", async () => {
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
