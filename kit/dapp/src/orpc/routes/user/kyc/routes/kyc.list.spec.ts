import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("KYC list", () => {
  let testUser1: Awaited<ReturnType<typeof createTestUser>>;
  let testUser2: Awaited<ReturnType<typeof createTestUser>>;
  let user1Data: Awaited<ReturnType<typeof getUserData>>;
  let user2Data: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Setup test users
    const users = await Promise.all([createTestUser(), createTestUser()]);
    testUser1 = users[0];
    testUser2 = users[1];
    const userData = await Promise.all([
      getUserData(testUser1.user),
      getUserData(testUser2.user),
    ]);
    user1Data = userData[0];
    user2Data = userData[1];

    // Create KYC profiles for test users
    const [headers1, headers2] = await Promise.all([
      signInWithUser(testUser1.user),
      signInWithUser(testUser2.user),
    ]);
    const client1 = getOrpcClient(headers1);
    const client2 = getOrpcClient(headers2);

    await Promise.all([
      client1.user.kyc.upsert({
        userId: user1Data.id,
        firstName: "John",
        lastName: "Doe",
        dob: new Date("1990-01-01"),
        country: "US",
        residencyStatus: "resident",
        nationalId: "123456789",
      }),
      client2.user.kyc.upsert({
        userId: user2Data.id,
        firstName: "Jane",
        lastName: "Smith",
        dob: new Date("1985-05-15"),
        country: "GB",
        residencyStatus: "resident",
        nationalId: "987654321",
      }),
    ]);
  });

  it("can list all KYC profiles as admin", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.user.kyc.list({
      limit: 10,
      offset: 0,
      orderBy: "createdAt",
      orderDirection: "desc",
    });

    expect(result.items).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);

    // Check that our test users' profiles are in the list
    const user1Profile = result.items.find((p) => p.userId === user1Data.id);
    const user2Profile = result.items.find((p) => p.userId === user2Data.id);

    expect(user1Profile).toBeDefined();
    expect(user1Profile?.firstName).toBe("John");
    expect(user1Profile?.lastName).toBe("Doe");

    expect(user2Profile).toBeDefined();
    expect(user2Profile?.firstName).toBe("Jane");
    expect(user2Profile?.lastName).toBe("Smith");
  });

  it("can search KYC profiles by name", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const result = await client.user.kyc.list({
      limit: 10,
      offset: 0,
      orderBy: "createdAt",
      orderDirection: "desc",
      search: "John",
    });

    expect(result.items.length).toBeGreaterThanOrEqual(1);
    const johnProfile = result.items.find((p) => p.firstName === "John");
    expect(johnProfile).toBeDefined();
    expect(johnProfile?.lastName).toBe("Doe");
  });

  it("can paginate KYC profiles", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Get first page
    const page1 = await client.user.kyc.list({
      limit: 1,
      offset: 0,
      orderBy: "createdAt",
      orderDirection: "desc",
    });

    expect(page1.items.length).toBeLessThanOrEqual(1);
    expect(page1.total).toBeGreaterThanOrEqual(2);

    // Get second page
    const page2 = await client.user.kyc.list({
      limit: 1,
      offset: 1,
      orderBy: "createdAt",
      orderDirection: "desc",
    });

    expect(page2.items.length).toBeLessThanOrEqual(1);

    // Ensure different items on different pages
    if (page1.items.length > 0 && page2.items.length > 0) {
      expect(page1.items[0]?.userId).not.toBe(page2.items[0]?.userId);
    }
  });

  it("can order KYC profiles by different fields", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Order by firstName ascending
    const ascResult = await client.user.kyc.list({
      limit: 10,
      offset: 0,
      orderBy: "firstName",
      orderDirection: "asc",
    });

    // Order by firstName descending
    const descResult = await client.user.kyc.list({
      limit: 10,
      offset: 0,
      orderBy: "firstName",
      orderDirection: "desc",
    });

    // Verify ordering is different
    if (ascResult.items.length > 1 && descResult.items.length > 1) {
      expect(ascResult.items[0]?.userId).not.toBe(descResult.items[0]?.userId);
    }
  });

  it("regular user cannot list all KYC profiles without permission", async () => {
    const headers = await signInWithUser(testUser1.user);
    const client = getOrpcClient(headers);

    await expect(
      client.user.kyc.list(
        {
          limit: 10,
          offset: 0,
          orderBy: "createdAt",
          orderDirection: "desc",
        },
        {
          context: {
            expectErrors: [CUSTOM_ERROR_CODES.FORBIDDEN],
          },
        }
      )
    ).rejects.toThrow();
  });
});
