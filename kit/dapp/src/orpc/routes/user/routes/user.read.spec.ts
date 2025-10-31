import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  getUserData,
  registerUserIdentity,
  signInWithUser,
} from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

describe("User read", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let otherUser: Awaited<ReturnType<typeof createTestUser>>;
  let unauthorizedUser: Awaited<ReturnType<typeof createTestUser>>;

  let testUserData: Awaited<ReturnType<typeof getUserData>>;
  let otherUserData: Awaited<ReturnType<typeof getUserData>>;
  let unauthorizedUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Setup test users
    [testUser, otherUser, unauthorizedUser] = await Promise.all([
      createTestUser(),
      createTestUser(),
      createTestUser(),
    ]);

    [testUserData, otherUserData, unauthorizedUserData] = await Promise.all([
      getUserData(testUser.user),
      getUserData(otherUser.user),
      getUserData(unauthorizedUser.user),
    ]);

    // Register identities for all test users using admin client
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    const adminClient = getOrpcClient(adminHeaders);

    await Promise.all([
      testUserData.wallet &&
        registerUserIdentity(adminClient, testUserData.wallet),
      otherUserData.wallet &&
        registerUserIdentity(adminClient, otherUserData.wallet),
      unauthorizedUserData.wallet &&
        registerUserIdentity(adminClient, unauthorizedUserData.wallet),
    ]);

    // Create KYC profiles for better test coverage
    const testUserHeaders = await signInWithUser(testUser.user);
    const testUserClient = getOrpcClient(testUserHeaders);
    await testUserClient.user.kyc.upsert({
      userId: testUserData.id,
      firstName: "TestFirst",
      lastName: "TestLast",
      dob: new Date("1990-01-01"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "TEST123456",
    });

    const otherUserHeaders = await signInWithUser(otherUser.user);
    const otherUserClient = getOrpcClient(otherUserHeaders);

    await otherUserClient.user.kyc.upsert({
      userId: otherUserData.id,
      firstName: "OtherFirst",
      lastName: "OtherLast",
      dob: new Date("1985-05-15"),
      country: "GB",
      residencyStatus: "resident",
      nationalId: "OTHER987654",
    });
  }, 100_000);

  describe("Admin access", () => {
    it("admin can read user by ID", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const user = await client.user.readByUserId({
        userId: testUserData.id,
      });

      expect(user).toBeDefined();
      expect(user.id).toBe(testUserData.id);
      expect(user.email).toBe(testUser.user.email);
      expect(user.wallet).toBe(testUserData.wallet);
      expect(user.firstName).toBe("TestFirst");
      expect(user.lastName).toBe("TestLast");
      expect(user.name).toBe("TestFirst TestLast");
      expect(user.role).toBeDefined();
    });

    it("admin can read user by wallet address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const user = await client.user.readByWallet({
        wallet: testUserData.wallet,
      });

      expect(user).toBeDefined();
      expect(user.id).toBe(testUserData.id);
      expect(user.email).toBe(testUser.user.email);
      expect(user.wallet).toBe(testUserData.wallet);
      expect(user.firstName).toBe("TestFirst");
      expect(user.lastName).toBe("TestLast");
    });

    it("admin can read any user's information", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Read first user
      const user1 = await client.user.readByUserId({
        userId: testUserData.id,
      });

      expect(user1).toBeDefined();
      expect(user1.id).toBe(testUserData.id);

      // Read second user
      const user2 = await client.user.readByUserId({
        userId: otherUserData.id,
      });

      expect(user2).toBeDefined();
      expect(user2.id).toBe(otherUserData.id);
      expect(user2.firstName).toBe("OtherFirst");
      expect(user2.lastName).toBe("OtherLast");
    });
  });

  describe("Permission checks", () => {
    it("regular user without 'user:list' permission cannot read other users by ID", async () => {
      const headers = await signInWithUser(unauthorizedUser.user);
      const client = getOrpcClient(headers);

      await expect(
        client.user.readByUserId(
          {
            userId: testUserData.id,
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

    it("regular user without 'user:list' permission cannot read other users by wallet", async () => {
      const headers = await signInWithUser(unauthorizedUser.user);
      const client = getOrpcClient(headers);

      await expect(
        client.user.readByWallet(
          {
            wallet: testUserData.wallet,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
            },
          }
        )
      ).rejects.toThrow();
    });

    it("regular user without permission cannot even read their own user data", async () => {
      // This tests that there's no alwaysAllowIf condition for own user
      const headers = await signInWithUser(unauthorizedUser.user);
      const client = getOrpcClient(headers);

      await expect(
        client.user.readByUserId(
          {
            userId: unauthorizedUserData.id,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
            },
          }
        )
      ).rejects.toThrow();
    });

    it("user with proper permissions can read user data", async () => {
      // Admin has the required 'user:list' permission
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const user = await client.user.readByUserId({
        userId: otherUserData.id,
      });

      expect(user).toBeDefined();
      expect(user.id).toBe(otherUserData.id);
    });
  });

  describe("Error handling", () => {
    it("throws NOT_FOUND when reading non-existent user by ID", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const nonExistentUserId = randomUUID();

      await expect(
        client.user.readByUserId(
          {
            userId: nonExistentUserId,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.NOT_FOUND],
            },
          }
        )
      ).rejects.toThrow();
    });

    it("throws NOT_FOUND when reading non-existent user by wallet", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Use a definitely non-existent wallet address (not zero address which might exist)
      const nonExistentWallet = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";

      await expect(
        client.user.readByWallet(
          {
            wallet: nonExistentWallet,
          },
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.NOT_FOUND],
            },
          }
        )
      ).rejects.toThrow();
    });
  });

  describe("Data integrity", () => {
    it("returns user without KYC data when KYC profile doesn't exist", async () => {
      // Create a new user without KYC profile
      const { user: userWithoutKyc } = await createTestUser();
      const userWithoutKycData = await getUserData(userWithoutKyc);

      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const user = await client.user.readByUserId({
        userId: userWithoutKycData.id,
      });

      expect(user).toBeDefined();
      expect(user.id).toBe(userWithoutKycData.id);
      expect(user.email).toBe(userWithoutKyc.email);
      expect(user.firstName).toBeUndefined();
      expect(user.lastName).toBeUndefined();
      // Should use the original name when KYC data is not available
      expect(user.name).toBe(
        `${userWithoutKyc.firstName} ${userWithoutKyc.lastName}`
      );
    });

    it("returns consistent data when reading by ID vs wallet", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const userById = await client.user.readByUserId({
        userId: testUserData.id,
      });

      const userByWallet = await client.user.readByWallet({
        wallet: testUserData.wallet,
      });

      const userByWallet = await client.user.readByWallet({
        wallet: testUserData.wallet,
      });

      expect(userById).toEqual(userByWallet);
    });

    it("correctly transforms user role to display name", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const user = await client.user.readByUserId({
        userId: testUserData.id,
      });

      expect(user.role).toBeDefined();
      expect(typeof user.role).toBe("string");
      // Role should be a human-readable string, not an internal code
      expect(user.role).not.toBe("");
    });
  });

  describe("Identity permissions middleware", () => {
    it("forbids regular users without permissions", async () => {
      const headers = await signInWithUser(unauthorizedUser.user);
      const client = getOrpcClient(headers);

      await expect(
        client.user.readByUserId(
          {
            userId: testUserData.id,
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
});
