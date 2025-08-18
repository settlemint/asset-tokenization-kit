import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  setupUser,
  signInWithUser,
  DEFAULT_ADMIN,
  getUserData,
} from "@test/fixtures/user";

describe("KYC delete", () => {
  const createTestUser = () => ({
    email: `${randomUUID()}@test.com`,
    name: "KYC Delete Test User",
    password: "settlemint",
  });

  it("can delete own KYC profile", async () => {
    const testUser = createTestUser();
    await setupUser(testUser);
    const userData = await getUserData(testUser);

    const headers = await signInWithUser(testUser);
    const client = getOrpcClient(headers);

    // First create a KYC profile
    await client.user.kyc.upsert({
      userId: userData.id,
      firstName: "ToDelete",
      lastName: "Profile",
      dob: new Date("1990-01-01"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "DEL123456",
    });

    // Verify it exists
    const profileBeforeDelete = await client.user.kyc.read({
      userId: userData.id,
    });
    expect(profileBeforeDelete).toBeDefined();
    expect(profileBeforeDelete.firstName).toBe("ToDelete");

    // Delete the profile
    const deleteResult = await client.user.kyc.remove({
      userId: userData.id,
    });

    expect(deleteResult).toBeDefined();
    expect(deleteResult.userId).toBe(userData.id);

    // Verify it's deleted
    await expect(
      client.user.kyc.read({
        userId: userData.id,
      })
    ).rejects.toThrow();
  });

  it("admin can delete any user's KYC profile", async () => {
    const testUser = createTestUser();
    await setupUser(testUser);
    const userData = await getUserData(testUser);

    // Create profile as user
    const userHeaders = await signInWithUser(testUser);
    const userClient = getOrpcClient(userHeaders);

    await userClient.user.kyc.upsert({
      userId: userData.id,
      firstName: "AdminDelete",
      lastName: "Test",
      dob: new Date("1985-05-05"),
      country: "GB",
      residencyStatus: "resident",
      nationalId: "ADM987654",
    });

    // Delete as admin
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    const adminClient = getOrpcClient(adminHeaders);

    const deleteResult = await adminClient.user.kyc.remove({
      userId: userData.id,
    });

    expect(deleteResult).toBeDefined();
    expect(deleteResult.userId).toBe(userData.id);

    // Verify it's deleted
    await expect(
      adminClient.user.kyc.read({
        userId: userData.id,
      })
    ).rejects.toThrow();
  });

  it("regular user cannot delete another user's KYC profile", async () => {
    const user1 = createTestUser();
    const user2 = createTestUser();

    await Promise.all([setupUser(user1), setupUser(user2)]);

    const [, user2Data] = await Promise.all([
      getUserData(user1),
      getUserData(user2),
    ]);

    // Create profile for user2
    const user2Headers = await signInWithUser(user2);
    const user2Client = getOrpcClient(user2Headers);

    await user2Client.user.kyc.upsert({
      userId: user2Data.id,
      firstName: "Protected",
      lastName: "Profile",
      dob: new Date("1992-08-10"),
      country: "CA",
      residencyStatus: "resident",
      nationalId: "CA123456",
    });

    // Try to delete as user1 - should fail
    const user1Headers = await signInWithUser(user1);
    const user1Client = getOrpcClient(user1Headers);

    await expect(
      user1Client.user.kyc.remove({
        userId: user2Data.id,
      })
    ).rejects.toThrow();

    // Verify profile still exists
    const user2ProfileCheck = await user2Client.user.kyc.read({
      userId: user2Data.id,
    });
    expect(user2ProfileCheck).toBeDefined();
    expect(user2ProfileCheck.firstName).toBe("Protected");
  });

  it("throws NOT_FOUND when deleting non-existent KYC profile", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const nonExistentUserId = randomUUID();

    await expect(
      client.user.kyc.remove({
        userId: nonExistentUserId,
      })
    ).rejects.toThrow();
  });

  it("can delete and recreate KYC profile", async () => {
    const testUser = createTestUser();
    await setupUser(testUser);
    const userData = await getUserData(testUser);

    const headers = await signInWithUser(testUser);
    const client = getOrpcClient(headers);

    // Create initial profile
    await client.user.kyc.upsert({
      userId: userData.id,
      firstName: "Initial",
      lastName: "Profile",
      dob: new Date("1990-01-01"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "INIT123",
    });

    // Delete it
    await client.user.kyc.remove({
      userId: userData.id,
    });

    // Recreate with different data
    const newProfile = await client.user.kyc.upsert({
      userId: userData.id,
      firstName: "Recreated",
      lastName: "Profile",
      dob: new Date("1991-02-02"),
      country: "FR",
      residencyStatus: "resident",
      nationalId: "NEW456",
    });

    expect(newProfile).toBeDefined();
    expect(newProfile.firstName).toBe("Recreated");
    expect(newProfile.country).toBe("FR");
    expect(newProfile.nationalId).toBe("NEW456");
  });

  it("deleting already deleted profile throws NOT_FOUND", async () => {
    const testUser = createTestUser();
    await setupUser(testUser);
    const userData = await getUserData(testUser);

    const headers = await signInWithUser(testUser);
    const client = getOrpcClient(headers);

    // Create and delete profile
    await client.user.kyc.upsert({
      userId: userData.id,
      firstName: "ToDelete",
      lastName: "Twice",
      dob: new Date("1990-01-01"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "DEL789",
    });

    await client.user.kyc.remove({
      userId: userData.id,
    });

    // Try to delete again - should throw NOT_FOUND
    await expect(
      client.user.kyc.remove({
        userId: userData.id,
      })
    ).rejects.toThrow();
  });
});
