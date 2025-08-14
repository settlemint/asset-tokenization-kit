import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

describe("KYC read", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let otherUser: Awaited<ReturnType<typeof createTestUser>>;
  let testUserData: Awaited<ReturnType<typeof getUserData>>;
  let otherUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    testUser = await createTestUser();
    otherUser = await createTestUser();
    testUserData = await getUserData(testUser.user);
    otherUserData = await getUserData(otherUser.user);

    // Create KYC profile for test user
    const headers = await signInWithUser(testUser.user);
    const client = getOrpcClient(headers);
    await client.user.kyc.upsert({
      userId: testUserData.id,
      firstName: "Alice",
      lastName: "Johnson",
      dob: new Date("1992-03-20"),
      country: "CA",
      residencyStatus: "resident",
      nationalId: "AB123456",
    });

    // Create KYC profile for other user
    const otherHeaders = await signInWithUser(otherUser.user);
    const otherClient = getOrpcClient(otherHeaders);
    await otherClient.user.kyc.upsert({
      userId: otherUserData.id,
      firstName: "Bob",
      lastName: "Wilson",
      dob: new Date("1988-07-10"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "DL987654",
    });
  });

  it("can read own KYC profile", async () => {
    const headers = await signInWithUser(testUser.user);
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
    const headers = await signInWithUser(testUser.user);
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
    const headers = await signInWithUser(otherUser.user);
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
