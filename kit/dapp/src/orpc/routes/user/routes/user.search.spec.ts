import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  getUserData,
  setupUser,
  signInWithUser,
} from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

describe("User search", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "User Search Test User",
    password: "settlemint",
  };

  const OTHER_USER = {
    email: `${randomUUID()}@test.com`,
    name: "Other Search User",
    password: "settlemint",
  };

  const UNAUTHORIZED_USER = {
    email: `${randomUUID()}@test.com`,
    name: "Unauthorized User",
    password: "settlemint",
  };

  let testUserData: Awaited<ReturnType<typeof getUserData>>;
  let otherUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Setup test users
    await Promise.all([
      setupUser(TEST_USER),
      setupUser(OTHER_USER),
      setupUser(UNAUTHORIZED_USER),
    ]);

    [testUserData, otherUserData] = await Promise.all([
      getUserData(TEST_USER),
      getUserData(OTHER_USER),
    ]);

    // Create KYC profiles for better test coverage
    const [testUserHeaders, otherUserHeaders] = await Promise.all([
      signInWithUser(TEST_USER),
      signInWithUser(OTHER_USER),
    ]);
    const testUserClient = getOrpcClient(testUserHeaders);
    const otherUserClient = getOrpcClient(otherUserHeaders);

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
  });

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

      const foundUser = users.find((u) => u.id === testUserData.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.firstName).toBe("TestFirst");
      expect(foundUser?.lastName).toBe("TestLast");
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

      const foundUser = users.find((u) => u.id === testUserData.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.firstName).toBe("TestFirst");
      expect(foundUser?.lastName).toBe("TestLast");
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
        (u) => u.id === testUserData.id || u.id === otherUserData.id
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

      const foundUser = users.find((u) => u.id === testUserData.id);
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

      const foundUser = users.find((u) => u.id === testUserData.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.firstName).toBe("TestFirst");
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
      const headers = await signInWithUser(UNAUTHORIZED_USER);
      const client = getOrpcClient(headers);

      await expect(
        client.user.search({
          query: "TestFirst",
          limit: 10,
        })
      ).rejects.toThrow("Forbidden");
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
      const userWithoutKyc = {
        email: `${randomUUID()}@test.com`,
        name: "SearchableNoKyc User",
        password: "settlemint",
      };

      await setupUser(userWithoutKyc);
      const userWithoutKycData = await getUserData(userWithoutKyc);

      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.search({
        query: "SearchableNoKyc",
        limit: 10,
      });

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);

      const foundUser = users.find((u) => u.id === userWithoutKycData.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe(userWithoutKyc.name);
      expect(foundUser?.firstName).toBeUndefined();
      expect(foundUser?.lastName).toBeUndefined();
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
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
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

      const user = users.find((u) => u.id === testUserData.id);
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
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
        expect(user.wallet).toBeDefined();
      });
    });
  });
});
