import { beforeEach, describe, expect, it, jest } from "bun:test";
import { randomUUID } from "node:crypto";
import { DEFAULT_ADMIN, getUserData, setupUser, signInWithUser } from "@atk/auth/test/fixtures/user";
import { getTestOrpcClient } from "@test/fixtures/orpc-client";
import {
  createBaseContext,
  createMockErrors,
  getAuthHandler,
  type OrpcHandler,
  resetAllMocks,
} from "@test/orpc-route-helpers";

import "../../../../../../src/routes/user/kyc/routes/kyc.delete";

function getHandler(): OrpcHandler {
  const handler = getAuthHandler();
  if (!handler) {
    throw new Error("Handler not captured - check mock setup");
  }
  return handler;
}

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
    const client = getTestOrpcClient(headers);

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
    const userClient = getTestOrpcClient(userHeaders);

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
    const adminClient = getTestOrpcClient(adminHeaders);

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

    const [, user2Data] = await Promise.all([getUserData(user1), getUserData(user2)]);

    // Create profile for user2
    const user2Headers = await signInWithUser(user2);
    const user2Client = getTestOrpcClient(user2Headers);

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
    const user1Client = getTestOrpcClient(user1Headers);

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
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

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

describe("user.kyc.delete unit", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    handler = getHandler();
    errors = createMockErrors();
  });

  it("deletes profile and returns userId", async () => {
    const mockReturning = jest.fn().mockResolvedValue([{ userId: "u1" }]);
    const mockDb = {
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: mockReturning,
        }),
      }),
    };

    const context = createBaseContext({
      db: mockDb,
    });

    const result = await handler({
      input: { userId: "u1" },
      context,
      errors,
    });

    expect(result).toEqual({ userId: "u1" });
    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockReturning).toHaveBeenCalled();
  });

  it("throws NOT_FOUND when nothing deleted", async () => {
    const mockReturning = jest.fn().mockResolvedValue([]); // Empty array means nothing was deleted
    const mockDb = {
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: mockReturning,
        }),
      }),
    };

    const context = createBaseContext({
      db: mockDb,
    });

    await expect(
      handler({
        input: { userId: "u1" },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockReturning).toHaveBeenCalled();
  });

  it("handles database errors properly", async () => {
    const mockDb = {
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error("Database connection error")),
        }),
      }),
    };

    const context = createBaseContext({
      db: mockDb,
    });

    await expect(
      handler({
        input: { userId: "u2" },
        context,
        errors,
      })
    ).rejects.toThrowError("Database connection error");

    expect(mockDb.delete).toHaveBeenCalled();
  });

  it("deletes correct profile by userId", async () => {
    const mockReturning = jest.fn().mockResolvedValue([{ userId: "specific_user_123" }]);
    const mockWhere = jest.fn().mockReturnValue({
      returning: mockReturning,
    });
    const mockDb = {
      delete: jest.fn().mockReturnValue({
        where: mockWhere,
      }),
    };

    const context = createBaseContext({
      db: mockDb,
    });

    const result = await handler({
      input: { userId: "specific_user_123" },
      context,
      errors,
    });

    expect(result).toEqual({ userId: "specific_user_123" });
    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockReturning).toHaveBeenCalled();
  });
});
