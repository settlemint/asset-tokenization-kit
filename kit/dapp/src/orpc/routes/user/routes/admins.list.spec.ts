import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, it } from "vitest";

describe("Admins list", () => {
  it("can list admins", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const admins = await client.user.adminList({});
    expect(admins.length).toBeGreaterThanOrEqual(1);
    const defaultAdmin = admins.find((a) => a.email === DEFAULT_ADMIN.email);
    expect(defaultAdmin).toBeDefined();
    expect(defaultAdmin?.email).toBe(DEFAULT_ADMIN.email);
    expect(defaultAdmin?.name).toBe(
      `${DEFAULT_ADMIN.name} (Integration tests)`
    );
    expect(defaultAdmin?.roles?.admin).toBe(true);
  });

  it("investor cannot list admins", async () => {
    const headers = await signInWithUser(DEFAULT_INVESTOR);
    const client = getOrpcClient(headers);
    await expect(client.user.adminList({})).rejects.toThrow(
      "User does not have the required role to execute this action."
    );
  });
});
