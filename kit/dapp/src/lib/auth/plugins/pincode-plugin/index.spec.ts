import { getAuthClient } from "@test/fixtures/auth-client";
import { createTestUser, signInWithUser } from "@test/fixtures/user";
import { beforeAll, describe, expect, test } from "vitest";

describe("Pincode verification", () => {
  let authClient: ReturnType<typeof getAuthClient>;
  let testUser: Awaited<ReturnType<typeof createTestUser>>["user"];

  beforeAll(async () => {
    authClient = getAuthClient();
    const { user } = await createTestUser();
    testUser = user;
  });

  test("can disable a pincode verification", async () => {
    const headers = await signInWithUser(testUser, true);
    const { data, error } = await authClient.pincode.disable(
      {},
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.success).toBe(true);
  });

  test("can enable a pincode verification", async () => {
    const headers = await signInWithUser(testUser, true);
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

  test("can update a pincode verification", async () => {
    const headers = await signInWithUser(testUser, true);
    const { data, error } = await authClient.pincode.update(
      {
        newPincode: "222222",
      },
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.success).toBe(true);
  });
});
