import { getOrpcClient } from "test/utils/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "test/utils/user";
import { describe, expect, test } from "vitest";

describe("System Compliance Module create", () => {
  test("can create a compliance module", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.complianceModuleCreate({
      verification: {
        verificationCode: DEFAULT_PINCODE,
        verificationType: "pincode",
      },
      complianceModules: [
        {
          type: "SMARTIdentityVerificationComplianceModule",
        },
        {
          type: "CountryAllowListComplianceModule",
        },
        {
          type: "CountryBlockListComplianceModule",
        },
      ],
    });

    const updatedSystem = await client.system.read({ id: result.id });
    expect(updatedSystem.complianceModules.length).toBeGreaterThanOrEqual(3);
  });
});
