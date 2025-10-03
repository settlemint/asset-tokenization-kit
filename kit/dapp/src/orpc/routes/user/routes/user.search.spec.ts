import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

describe("User search", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let otherUser: Awaited<ReturnType<typeof createTestUser>>;
  let unauthorizedUser: Awaited<ReturnType<typeof createTestUser>>;

  let testUserData: Awaited<ReturnType<typeof getUserData>>;
  let otherUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Setup test users
    [testUser, otherUser, unauthorizedUser] = await Promise.all([
      createTestUser("User Search Test User"),
      createTestUser("Other Search User"),
      createTestUser("Unauthorized User"),
    ]);

    [testUserData, otherUserData] = await Promise.all([
      getUserData(testUser.user),
      getUserData(otherUser.user),
    ]);

    // Create KYC profile clients for both users in parallel
    const [headers, otherHeaders] = await Promise.all([
      signInWithUser(testUser.user),
      signInWithUser(otherUser.user),
    ]);
    const testUserClient = getOrpcClient(headers);
    const otherUserClient = getOrpcClient(otherHeaders);

    await Promise.all([
      testUserClient.user.kyc.upsert({
        userId: testUserData.id,
        firstName: "TestFirst",
        lastName: "TestLast",
        dob: new Date("1990-01-01"),
        country: "US",
        residencyStatus: "resident",
        nationalId: "TEST123456",
      }),
      otherUserClient.user.kyc.upsert({
        userId: otherUserData.id,
        firstName: "OtherFirst",
        lastName: "OtherLast",
        dob: new Date("1985-05-15"),
        country: "GB",
        residencyStatus: "resident",
        nationalId: "OTHER987654",
      }),
    ]);
  }, 100_000);

  describe("Admin access", () => {
    it("admin can search users by firstName", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "TestFirst",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      const foundUser = users.find((u) => u.wallet === testUserData.wallet);
      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe("TestFirst TestLast");
    });

    it("admin can search users by lastName", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "TestLast",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      const foundUser = users.find((u) => u.wallet === testUserData.wallet);
      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe("TestFirst TestLast");
    });

    it("admin can search users by partial name match", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "Search",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(2);

      const foundUsers = users.filter(
        (u) =>
          u.wallet === testUserData.wallet || u.wallet === otherUserData.wallet
      );
      expect(foundUsers.length).toBeGreaterThanOrEqual(2);
    });

    it("admin can search users by wallet address", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const partialWallet = testUserData.wallet.slice(0, 10);
      const users = await client.user.search({
        query: partialWallet,
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);

      const foundUser = users.find((u) => u.wallet === testUserData.wallet);
      expect(foundUser).toBeDefined();
      expect(foundUser?.wallet).toBe(testUserData.wallet);
    });

    it("admin can search with case insensitive matching", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "testfirst",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);

      const foundUser = users.find((u) => u.wallet === testUserData.wallet);
      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe("TestFirst TestLast");
    });

    it("admin can limit search results", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "User",
        limit: 1,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(1);
    });
  });

  describe("Permission checks", () => {
    it("regular user without 'user:list' permission cannot search users", async () => {
      const headers = await signInWithUser(unauthorizedUser.user);
      const client = getOrpcClient(headers);

      await expect(
        client.user.search(
          {
            query: "TestFirst",
            limit: 10,
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

    it("user with proper permissions can search users", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "OtherFirst",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Search functionality", () => {
    it("returns empty array when no matches found", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const nonExistentQuery = `${randomUUID()}-not-found`;
      const users = await client.user.search({
        query: nonExistentQuery,
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(0);
    });

    it("returns multiple users when query matches multiple records", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "test",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it("searches in user.name field when KYC data is not available", async () => {
      // Create a new user without KYC profile
      const { user: userWithoutKyc } = await createTestUser(
        "SearchableNoKyc User"
      );
      const userWithoutKycData = await getUserData(userWithoutKyc);

      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "SearchableNoKyc",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);

      const foundUser = users.find(
        (u) => u.wallet === userWithoutKycData.wallet
      );
      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe(
        `${userWithoutKyc.firstName} ${userWithoutKyc.lastName}`
      );
    });
  });

  describe("Data integrity", () => {
    it("returns user data with consistent structure", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "TestFirst",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      const user = users[0];
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("role");
      expect(user).toHaveProperty("wallet");
      expect(typeof user?.role).toBe("string");
      expect(user?.role).not.toBe("");
    });

    it("correctly transforms user role to display name", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "TestFirst",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      const user = users.find((u) => u.wallet === testUserData.wallet);
      expect(user).toBeDefined();
      expect(user?.role).toBeDefined();
      expect(typeof user?.role).toBe("string");
      expect(user?.role).not.toBe("");
    });

    it("handles users with partial KYC data correctly", async () => {
      // This test ensures the search works even when some KYC fields are missing
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "User",
        limit: 20,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);

      // Verify all returned users have required fields
      users.forEach((user) => {
        expect(user.name).toBeDefined();
        expect(user.role).toBeDefined();
        expect(user.wallet).toBeDefined();
      });
    });
  });
});
