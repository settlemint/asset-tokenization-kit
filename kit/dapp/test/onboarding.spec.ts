import { beforeAll, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { isAddress } from "viem";
import {
  authClient,
  DEFAULT_PINCODE,
  signInWithUser,
} from "./utils/auth-client";

describe("Onboarding", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "test",
    password: "settlemint",
  };

  beforeAll(async () => {
    await authClient.signUp.email(TEST_USER);
  });

  it("can create a wallet", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.wallet(
      { messages: {} },
      {
        headers,
      }
    );
    expect(error).toBeNull();
    expect(data?.wallet).toBeDefined();
    expect(isAddress(data?.wallet ?? "")).toBe(true);
  });

  it("can set a pincode verification", async () => {
    const headers = await signInWithUser(TEST_USER);
    const { data, error } = await authClient.pincode.enable(
      {
        pincode: DEFAULT_PINCODE,
      },
      {
        headers,
        onError: (context) => {
          console.log(context);
        },
      }
    );
    expect(error).toBeNull();
    expect(data?.success).toBe(true);
  });
});
