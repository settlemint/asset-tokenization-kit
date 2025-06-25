import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { authClient, setupUser, signInWithUser } from "../utils/auth-client";

describe("Pincode verification", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
    await setupUser(TEST_USER);
  });

  it("can enable a pincode verification", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.pincode.enable(
      {
        pincode: "111111",
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
    expect(data).toBeUndefined();
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
});
