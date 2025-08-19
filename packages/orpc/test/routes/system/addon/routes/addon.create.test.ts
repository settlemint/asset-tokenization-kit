import { describe, expect, test } from "bun:test";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";

describe("System Addon create", () => {
  test("can create an addon", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);

    const result = await client.system.addonCreate({
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

    expect(result.systemAddons.length).toBeGreaterThanOrEqual(3);
  });
});
