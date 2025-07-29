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
    const system = await client.system.read({ id: "default" });

    expect(system?.systemAddonRegistry).toBeDefined();
    if (!system?.systemAddonRegistry) {
      return;
    }

    const result = await client.system.addonCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      contract: system.systemAddonRegistry,
      addons: [
        { type: "yield", name: "Yield Addon" },
        { type: "xvp", name: "XVP Addon" },
        { type: "airdrops", name: "Airdrops Addon" },
      ],
    });

    let isDeployed = false;
    for await (const event of result) {
      if (event.status !== "completed") {
        continue;
      }
      isDeployed = event.result?.length === 3;
    }

    expect(isDeployed).toBe(true);

    const updatedSystem = await client.system.read({ id: "default" });
    expect(updatedSystem.systemAddons.length).toBeGreaterThanOrEqual(3);
  });
});
