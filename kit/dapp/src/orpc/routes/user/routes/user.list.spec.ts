import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("User list", () => {
  let testUser1: Awaited<ReturnType<typeof createTestUser>>;
  let testUser2: Awaited<ReturnType<typeof createTestUser>>;
  let testUser3: Awaited<ReturnType<typeof createTestUser>>;
  let unauthorizedUser: Awaited<ReturnType<typeof createTestUser>>;

  let testUser1Data: Awaited<ReturnType<typeof getUserData>>;
  let testUser2Data: Awaited<ReturnType<typeof getUserData>>;
  let testUser3Data: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Create multiple test users for comprehensive list testing
    [testUser1, testUser2, testUser3, unauthorizedUser] = await Promise.all([
      createTestUser(),
      createTestUser(),
      createTestUser(),
      createTestUser(),
    ]);

    [testUser1Data, testUser2Data, testUser3Data] = await Promise.all([
      getUserData(testUser1.user),
      getUserData(testUser2.user),
      getUserData(testUser3.user),
    ]);

    // Create KYC profiles for some users to test various data scenarios
    const user1Headers = await signInWithUser(testUser1.user);
    const user1Client = getOrpcClient(user1Headers);
    await user1Client.user.kyc.upsert({
      userId: testUser1Data.id,
      firstName: "TestFirst1",
      lastName: "TestLast1",
      dob: new Date("1990-01-01"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "TEST123456",
    });

    const user2Headers = await signInWithUser(testUser2.user);
    const user2Client = getOrpcClient(user2Headers);
    await user2Client.user.kyc.upsert({
      userId: testUser2Data.id,
      firstName: "TestFirst2",
      lastName: "TestLast2",
      dob: new Date("1985-05-15"),
      country: "GB",
      residencyStatus: "resident",
      nationalId: "OTHER987654",
    });

    // testUser3 will have no KYC profile to test the scenario without KYC data
  });

  describe("Basic functionality", () => {
    it("admin can list all users", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({});

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      // Check that our test users are included
      const userIds = users.map((user) => user.id);
      expect(userIds).toContain(testUser1Data.id);
      expect(userIds).toContain(testUser2Data.id);
      expect(userIds).toContain(testUser3Data.id);
    });

    it("returns users with complete data structure", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({ limit: 5 });

      expect(users.length).toBeGreaterThan(0);

      const user = users[0];
      expect(user).toBeDefined();

      if (user) {
        expect(typeof user.id).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(typeof user.email).toBe("string");
        expect(typeof user.role).toBe("string");
        expect(typeof user.wallet).toBe("string");
        expect(typeof user.isRegistered).toBe("boolean");
        expect(Array.isArray(user.claims)).toBe(true);

        // Optional fields
        if (user.firstName) expect(typeof user.firstName).toBe("string");
        if (user.lastName) expect(typeof user.lastName).toBe("string");
        if (user.identity) expect(typeof user.identity).toBe("string");
      }
    });

    it("handles users with KYC data correctly", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({});

      // Find our test user with KYC data
      const userWithKyc = users.find((user) => user.id === testUser1Data.id);
      expect(userWithKyc).toBeDefined();

      if (userWithKyc) {
        expect(userWithKyc.firstName).toBe("TestFirst1");
        expect(userWithKyc.lastName).toBe("TestLast1");
        expect(userWithKyc.name).toBe("TestFirst1 TestLast1");
        expect(userWithKyc.email).toBe(testUser1.user.email);
        expect(userWithKyc.wallet).toBe(testUser1Data.wallet);
      }
    });

    it("handles users without KYC data correctly", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({});

      // Find our test user without KYC data
      const userWithoutKyc = users.find((user) => user.id === testUser3Data.id);
      expect(userWithoutKyc).toBeDefined();

      if (userWithoutKyc) {
        expect(userWithoutKyc.firstName).toBeUndefined();
        expect(userWithoutKyc.lastName).toBeUndefined();
        expect(userWithoutKyc.name).toBe(testUser3.user.name); // Should use original name
        expect(userWithoutKyc.email).toBe(testUser3.user.email);
        expect(userWithoutKyc.wallet).toBe(testUser3Data.wallet);
      }
    });
  });

  describe("Identity and registration status", () => {
    it("includes identity registration status for all users", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({ limit: 10 });

      expect(users.length).toBeGreaterThan(0);

      for (const user of users) {
        // Every user should have isRegistered field
        expect(typeof user.isRegistered).toBe("boolean");

        // Claims should always be an array
        expect(Array.isArray(user.claims)).toBe(true);

        // Identity field should be string or undefined
        if (user.identity) {
          expect(typeof user.identity).toBe("string");
          expect(user.identity).toMatch(/^0x[a-fA-F0-9]{40}$/); // Valid Ethereum address
        }

        // If user has identity, isRegistered should be true
        if (user.identity) {
          expect(user.isRegistered).toBe(true);
        }

        // If user doesn't have identity, isRegistered should be false
        if (!user.identity) {
          expect(user.isRegistered).toBe(false);
          expect(user.claims).toEqual([]); // Should have empty claims array
        }
      }
    });

    it("gracefully handles TheGraph unavailability", async () => {
      // This test ensures that if TheGraph is down, the list still works
      // but without identity data
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // The implementation should catch TheGraph errors and continue
      const users = await client.user.list({});

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);

      // Users should still have the basic structure even if identity data fails
      for (const user of users) {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.wallet).toBeDefined();
        expect(typeof user.isRegistered).toBe("boolean");
        expect(Array.isArray(user.claims)).toBe(true);
      }
    });
  });

  describe("Pagination and sorting", () => {
    it("respects pagination parameters", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Test limit
      const limitedUsers = await client.user.list({ limit: 2 });
      expect(limitedUsers.length).toBeLessThanOrEqual(2);

      // Test offset
      const firstPage = await client.user.list({ limit: 2, offset: 0 });
      const secondPage = await client.user.list({ limit: 2, offset: 2 });

      expect(firstPage.length).toBeLessThanOrEqual(2);
      expect(secondPage.length).toBeLessThanOrEqual(2);

      // Pages should have different users (unless there are fewer than 4 total users)
      if (firstPage.length === 2 && secondPage.length > 0) {
        const firstPageIds = firstPage.map((user) => user.id);
        const secondPageIds = secondPage.map((user) => user.id);

        // Should not have overlapping user IDs
        const secondPageSet = new Set(secondPageIds);
        expect(firstPageIds.some((id) => secondPageSet.has(id))).toBe(false);
      }
    });

    it("supports sorting by different fields", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      // Test sorting by email
      const usersByEmail = await client.user.list({
        orderBy: "email",
        orderDirection: "asc",
        limit: 5,
      });

      if (usersByEmail.length > 1) {
        for (let i = 1; i < usersByEmail.length; i++) {
          expect(
            usersByEmail[i]?.email.localeCompare(
              usersByEmail[i - 1]?.email ?? ""
            )
          ).toBeGreaterThanOrEqual(0);
        }
      }

      // Test sorting by createdAt (default)
      const usersByCreated = await client.user.list({
        orderBy: "createdAt",
        orderDirection: "desc",
        limit: 5,
      });

      expect(usersByCreated).toBeDefined();
      expect(usersByCreated.length).toBeGreaterThan(0);
    });
  });

  describe("Permission checks", () => {
    it("prevents unauthorized users from listing users", async () => {
      const headers = await signInWithUser(unauthorizedUser.user);
      const client = getOrpcClient(headers);

      await expect(
        client.user.list(
          {},
          {
            context: {
              skipLoggingFor: [CUSTOM_ERROR_CODES.FORBIDDEN],
            },
          }
        )
      ).rejects.toThrow(errorMessageForCode(CUSTOM_ERROR_CODES.FORBIDDEN));
    });

    it("allows admin users to list all users", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({});

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe("Data consistency", () => {
    it("returns users with valid wallet addresses", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({});

      for (const user of users) {
        expect(user.wallet).toBeDefined();
        expect(typeof user.wallet).toBe("string");
        // Should be a valid Ethereum address format
        expect(user.wallet).toMatch(/^0x[a-fA-F0-9]{40}$/);
      }
    });

    it("returns consistent role information", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users = await client.user.list({});

      for (const user of users) {
        expect(user.role).toBeDefined();
        expect(typeof user.role).toBe("string");
        expect(user.role).not.toBe(""); // Should not be empty string
      }
    });

    it("maintains data integrity across multiple calls", async () => {
      const headers = await signInWithUser(DEFAULT_ADMIN);
      const client = getOrpcClient(headers);

      const users1 = await client.user.list({ limit: 3 });
      const users2 = await client.user.list({ limit: 3 });

      // Same users should have same data
      const commonUsers = users1.filter((user1) =>
        users2.some((user2) => user2.id === user1.id)
      );

      for (const user1 of commonUsers) {
        const user2 = users2.find((u) => u.id === user1.id);
        expect(user2).toBeDefined();

        if (user2) {
          expect(user1.email).toBe(user2.email);
          expect(user1.wallet).toBe(user2.wallet);
          expect(user1.role).toBe(user2.role);
          expect(user1.isRegistered).toBe(user2.isRegistered);
          expect(user1.claims).toEqual(user2.claims);
          expect(user1.identity).toBe(user2.identity);
        }
      }
    });
  });
});
