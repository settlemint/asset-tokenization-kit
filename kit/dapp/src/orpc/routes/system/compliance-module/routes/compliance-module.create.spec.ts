import { complianceTypeIds } from "@atk/zod/compliance";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { describe, expect, test } from "vitest";

describe("System Compliance Module create", () => {
  test("can create a compliance module", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.compliance.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
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
    expect(
      updatedSystem.complianceModuleRegistry.complianceModules.length
    ).toBeGreaterThanOrEqual(3);
  });

  test("can create all compliance modules at once using 'all' option", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.system.compliance.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      complianceModules: "all",
    });

    const updatedSystem = await client.system.read({ id: result.id });

    // Should have all 6 compliance module types
    expect(
      updatedSystem.complianceModuleRegistry.complianceModules.length
    ).toBe(6);

    // Verify all expected compliance module types are present
    const expectedTypes = complianceTypeIds;

    const actualTypes =
      updatedSystem.complianceModuleRegistry.complianceModules.map(
        (module) => module.typeId
      );

    for (const expectedType of expectedTypes) {
      expect(actualTypes).toContain(expectedType);
    }
  });
});
