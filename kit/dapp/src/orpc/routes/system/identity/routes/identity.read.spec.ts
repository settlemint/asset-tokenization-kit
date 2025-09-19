import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  getUserData,
  registerUserIdentity,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("Identity read (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    targetTestUser = await createTestUser("identity-read-target");
    targetUserData = await getUserData(targetTestUser.user);

    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    if (!targetUserData.wallet) {
      throw new Error("Target user does not have a wallet address");
    }

    await registerUserIdentity(adminClient, targetUserData.wallet);
  }, 100_000);

  describe("Reading identity by wallet address", () => {
    it("returns identity when user reads their own identity by wallet", async () => {
      const userHeaders = await signInWithUser(targetTestUser.user);
      const userClient = getOrpcClient(userHeaders);

      const result = await userClient.system.identity.read({
        wallet: targetUserData.wallet,
      });

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result.account.id.toLowerCase()).toBe(
        targetUserData.wallet.toLowerCase()
      );
      expect(result.isContract).toBe(false);
      expect(result.claims).toHaveLength(0); // No claims yet in basic test
      expect(result.registered).toEqual({
        isRegistered: true,
        country: "BE",
      });
    });

    it("returns identity when admin reads any identity by wallet", async () => {
      const result = await adminClient.system.identity.read({
        wallet: targetUserData.wallet,
      });

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result.account.id.toLowerCase()).toBe(
        targetUserData.wallet.toLowerCase()
      );
      expect(result.isContract).toBe(false);
      expect(result.claims).toHaveLength(0); // No claims yet in basic test
    });

    it("throws NOT_FOUND when wallet does not exist", async () => {
      await expect(
        adminClient.system.identity.read(
          {
            wallet: "0x1111111111111111111111111111111111111111",
          },
          {
            context: {
              skipLoggingFor: ["NOT_FOUND"],
            },
          }
        )
      ).rejects.toThrow("No identity found for");
    });

    it("prevents investor from reading other identities by wallet", async () => {
      await expect(
        investorClient.system.identity.read(
          {
            wallet: targetUserData.wallet,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
            },
          }
        )
      ).rejects.toThrow(
        errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
      );
    });
  });

  describe("Reading identity by identity ID", () => {
    it("returns identity when user reads their own identity by ID", async () => {
      // First get the identity ID from reading by wallet
      const identityByWallet = await adminClient.system.identity.read({
        wallet: targetUserData.wallet,
      });

      const userHeaders = await signInWithUser(targetTestUser.user);
      const userClient = getOrpcClient(userHeaders);

      const result = await userClient.system.identity.read({
        identityId: identityByWallet.id,
      });

      expect(result).toBeDefined();
      expect(result.id.toLowerCase()).toBe(identityByWallet.id.toLowerCase());
      expect(result.account.id.toLowerCase()).toBe(
        targetUserData.wallet.toLowerCase()
      );
      expect(result.isContract).toBe(false);
      expect(result.claims).toHaveLength(0); // No claims yet in basic test
    });

    it("returns identity when admin reads any identity by ID", async () => {
      // First get the identity ID from reading by wallet
      const identityByWallet = await adminClient.system.identity.read({
        wallet: targetUserData.wallet,
      });

      const result = await adminClient.system.identity.read({
        identityId: identityByWallet.id,
      });

      expect(result).toBeDefined();
      expect(result.id.toLowerCase()).toBe(identityByWallet.id.toLowerCase());
      expect(result.account.id.toLowerCase()).toBe(
        targetUserData.wallet.toLowerCase()
      );
      expect(result.isContract).toBe(false);
      expect(result.claims).toHaveLength(0); // No claims yet in basic test
    });

    it("throws NOT_FOUND when identity ID does not exist", async () => {
      await expect(
        adminClient.system.identity.read(
          {
            identityId: "0x1111111111111111111111111111111111111111",
          },
          {
            context: {
              skipLoggingFor: ["NOT_FOUND"],
            },
          }
        )
      ).rejects.toThrow("No identity found for");
    });

    it("throws FORBIDDEN when investor tries to read other identity by ID", async () => {
      // First get the identity ID from reading by wallet
      const identityByWallet = await adminClient.system.identity.read({
        wallet: targetUserData.wallet,
      });

      await expect(
        investorClient.system.identity.read(
          {
            identityId: identityByWallet.id,
          },
          {
            context: {
              skipLoggingFor: ["FORBIDDEN"],
            },
          }
        )
      ).rejects.toThrow("You don't have permission to view this identity");
    });
  });

  describe("Data structure validation", () => {
    it("validates identity structure fields", async () => {
      const result = await adminClient.system.identity.read({
        wallet: targetUserData.wallet,
      });

      expect(result.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result.account.id).toMatch(/^0x[a-fA-F0-9]{40}$/);

      expect(Array.isArray(result.claims)).toBe(true);
      for (const claim of result.claims) {
        expect(typeof claim.revoked).toBe("boolean");
        expect(claim.id).toBeDefined();
        expect(claim.name).toBeDefined();
        expect(claim.issuer).toBeDefined();
        expect(Array.isArray(claim.values)).toBe(true);
      }

      if (result.registered) {
        expect(result.registered.isRegistered).toBe(true);
        expect(typeof result.registered.country).toBe("string");
        expect(result.registered.country).toHaveLength(2);
      }
    });
  });
});
