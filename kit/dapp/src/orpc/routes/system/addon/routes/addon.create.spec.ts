import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, test } from "vitest";

describe("System Addon create", () => {
  test("can create an addon", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.addon.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      addons: [
        { type: "yield", name: "Yield Addon" },
        { type: "xvp", name: "XVP Addon" },
        { type: "airdrops", name: "Airdrops Addon" },
      ],
    });

    expect(result.systemAddonRegistry.systemAddons.length).toBeGreaterThanOrEqual(3);
  });
});
