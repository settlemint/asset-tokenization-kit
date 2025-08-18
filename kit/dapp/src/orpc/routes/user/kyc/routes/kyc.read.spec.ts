import { beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  setupUser,
  signInWithUser,
  DEFAULT_ADMIN,
  getUserData,
} from "@test/fixtures/user";

describe("KYC read", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "KYC Read Test User",
    password: "settlemint",
  };

  const OTHER_USER = {
    email: `${randomUUID()}@test.com`,
    name: "Other User",
    password: "settlemint",
  };

  let testUserData: Awaited<ReturnType<typeof getUserData>>;
  let otherUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Setup test users
    await Promise.all([setupUser(TEST_USER), setupUser(OTHER_USER)]);

    [testUserData, otherUserData] = await Promise.all([
      getUserData(TEST_USER),
      getUserData(OTHER_USER),
    ]);

    // Create KYC profiles for both users
    const [headers, otherHeaders] = await Promise.all([
      signInWithUser(TEST_USER),
      signInWithUser(OTHER_USER),
    ]);
    const client = getOrpcClient(headers);
    const otherClient = getOrpcClient(otherHeaders);

    await Promise.all([
      client.user.kyc.upsert({
        userId: testUserData.id,
        firstName: "Alice",
        lastName: "Johnson",
        dob: new Date("1992-03-20"),
        country: "CA",
        residencyStatus: "resident",
        nationalId: "AB123456",
      }),
      otherClient.user.kyc.upsert({
        userId: otherUserData.id,
        firstName: "Bob",
        lastName: "Wilson",
        dob: new Date("1988-07-10"),
        country: "US",
        residencyStatus: "resident",
        nationalId: "DL987654",
      }),
    ]);
  });

  it("can read own KYC profile", async () => {
    const headers = await signInWithUser(TEST_USER);
    const client = getOrpcClient(headers);

    const profile = await client.user.kyc.read({
      userId: testUserData.id,
    });

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(testUserData.id);
    expect(profile.firstName).toBe("Alice");
    expect(profile.lastName).toBe("Johnson");
    expect(profile.dob).toEqual(new Date("1992-03-20"));
    expect(profile.country).toBe("CA");
    expect(profile.residencyStatus).toBe("resident");
    expect(profile.nationalId).toBe("AB123456");
  });

  it("admin can read any user's KYC profile", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const profile = await client.user.kyc.read({
      userId: testUserData.id,
    });

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(testUserData.id);
    expect(profile.firstName).toBe("Alice");
    expect(profile.lastName).toBe("Johnson");
  });

  it("regular user cannot read another user's KYC profile", async () => {
    const headers = await signInWithUser(TEST_USER);
    const client = getOrpcClient(headers);

    await expect(
      client.user.kyc.read({
        userId: otherUserData.id,
      })
    ).rejects.toThrow();
  });

  it("throws NOT_FOUND when reading non-existent KYC profile", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const nonExistentUserId = randomUUID();

    await expect(
      client.user.kyc.read({
        userId: nonExistentUserId,
      })
    ).rejects.toThrow();
  });

  it("user can read their own profile even without list permission", async () => {
    // This tests the alwaysAllowIf condition in the middleware
    const headers = await signInWithUser(OTHER_USER);
    const client = getOrpcClient(headers);

    const profile = await client.user.kyc.read({
      userId: otherUserData.id,
    });

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(otherUserData.id);
    expect(profile.firstName).toBe("Bob");
    expect(profile.lastName).toBe("Wilson");
  });
});
