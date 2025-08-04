import { getOrpcClient } from "test/utils/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "test/utils/user";
import { describe, expect, test } from "vitest";

describe("System Addon create", () => {
  test("can create an addon", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.addonCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      addons: [
        { type: "yield", name: "Yield Addon" },
        { type: "xvp", name: "XVP Addon" },
        { type: "airdrops", name: "Airdrops Addon" },
      ],
    });

    console.error(result);

    expect(result.systemAddons.length).toBeGreaterThanOrEqual(3);
  });
});
