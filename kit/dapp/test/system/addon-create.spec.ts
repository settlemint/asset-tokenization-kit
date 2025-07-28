import { getOrpcClient } from "test/utils/orpc-client";
import { DEFAULT_ADMIN, signInWithUser } from "test/utils/user";
import { describe, test } from "vitest";

describe("System Addon create", () => {
  test("can create an addon", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
  });
});
