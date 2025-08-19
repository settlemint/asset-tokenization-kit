import { beforeAll, beforeEach, describe, expect, it, jest } from "bun:test";
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

import "../../../../../../src/routes/user/kyc/routes/kyc.upsert";

function getHandler(): OrpcHandler {
  const handler = getAuthHandler();
  if (!handler) {
    throw new Error("Handler not captured - check mock setup");
  }
  return handler;
}

describe("KYC upsert", () => {
  const TEST_USER = {
    email: `${randomUUID()}@test.com`,
    name: "KYC Upsert Test User",
    password: "settlemint",
  };

  const OTHER_USER = {
    email: `${randomUUID()}@test.com`,
    name: "Other User for Upsert",
    password: "settlemint",
  };

  let testUserData: Awaited<ReturnType<typeof getUserData>>;
  let otherUserData: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Setup test users
    await Promise.all([setupUser(TEST_USER), setupUser(OTHER_USER)]);

    [testUserData, otherUserData] = await Promise.all([getUserData(TEST_USER), getUserData(OTHER_USER)]);
  });

  it("can create a new KYC profile", async () => {
    const headers = await signInWithUser(TEST_USER);
    const client = getTestOrpcClient(headers);

    const profile = await client.user.kyc.upsert({
      userId: testUserData.id,
      firstName: "Michael",
      lastName: "Brown",
      dob: new Date("1990-12-15"),
      country: "AU",
      residencyStatus: "resident",
      nationalId: "PA789012",
    });

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(testUserData.id);
    expect(profile.firstName).toBe("Michael");
    expect(profile.lastName).toBe("Brown");
    expect(profile.dob).toEqual(new Date("1990-12-15"));
    expect(profile.country).toBe("AU");
    expect(profile.residencyStatus).toBe("resident");
    expect(profile.nationalId).toBe("PA789012");
    expect(profile.createdAt).toBeDefined();
    expect(profile.updatedAt).toBeDefined();
  });

  it("can update an existing KYC profile", async () => {
    const headers = await signInWithUser(TEST_USER);
    const client = getTestOrpcClient(headers);

    // First create a profile
    await client.user.kyc.upsert({
      userId: testUserData.id,
      firstName: "Initial",
      lastName: "Name",
      dob: new Date("1990-01-01"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "INITIAL123",
    });

    // Now update it
    const updatedProfile = await client.user.kyc.upsert({
      userId: testUserData.id,
      firstName: "Updated",
      lastName: "Profile",
      dob: new Date("1990-01-01"),
      country: "GB",
      residencyStatus: "resident",
      nationalId: "UPDATED456",
    });

    expect(updatedProfile).toBeDefined();
    expect(updatedProfile.userId).toBe(testUserData.id);
    expect(updatedProfile.firstName).toBe("Updated");
    expect(updatedProfile.lastName).toBe("Profile");
    expect(updatedProfile.country).toBe("GB");
    expect(updatedProfile.residencyStatus).toBe("resident");
    expect(updatedProfile.nationalId).toBe("UPDATED456");
  });

  it("admin can upsert KYC profile for any user", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);

    const profile = await client.user.kyc.upsert({
      userId: otherUserData.id,
      firstName: "Admin",
      lastName: "Created",
      dob: new Date("1985-06-20"),
      country: "FR",
      residencyStatus: "resident",
      nationalId: "FR123456",
    });

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(otherUserData.id);
    expect(profile.firstName).toBe("Admin");
    expect(profile.lastName).toBe("Created");
  });

  it("regular user cannot upsert another user's KYC profile", async () => {
    const headers = await signInWithUser(TEST_USER);
    const client = getTestOrpcClient(headers);

    await expect(
      client.user.kyc.upsert({
        userId: otherUserData.id,
        firstName: "Unauthorized",
        lastName: "Update",
        dob: new Date("1990-01-01"),
        country: "US",
        residencyStatus: "resident",
        nationalId: "UNAUTH123",
      })
    ).rejects.toThrow();
  });

  it("can upsert with minimal required fields", async () => {
    const newUser = {
      email: `${randomUUID()}@test.com`,
      name: "Minimal KYC User",
      password: "settlemint",
    };
    await setupUser(newUser);
    const userData = await getUserData(newUser);

    const headers = await signInWithUser(newUser);
    const client = getTestOrpcClient(headers);

    const profile = await client.user.kyc.upsert({
      userId: userData.id,
      firstName: "Minimal",
      lastName: "User",
      dob: new Date("1995-01-01"),
      country: "US",
      residencyStatus: "resident",
      nationalId: "MIN123",
    });

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(userData.id);
    expect(profile.firstName).toBe("Minimal");
    expect(profile.lastName).toBe("User");
    // Fields not in the new schema are removed
  });

  it("upsert is idempotent - multiple calls with same data work", async () => {
    const headers = await signInWithUser(TEST_USER);
    const client = getTestOrpcClient(headers);

    const profileData = {
      userId: testUserData.id,
      firstName: "Idempotent",
      lastName: "Test",
      dob: new Date("1990-05-05"),
      country: "DE" as const,
      residencyStatus: "resident" as const,
      nationalId: "DE123456",
    };

    // First upsert
    const profile1 = await client.user.kyc.upsert(profileData);
    expect(profile1.firstName).toBe("Idempotent");

    // Second upsert with same data
    const profile2 = await client.user.kyc.upsert(profileData);
    expect(profile2.firstName).toBe("Idempotent");
    expect(profile2.userId).toBe(profile1.userId);
  });
});

describe("user.kyc.upsert unit", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    handler = getHandler();
    errors = createMockErrors();
  });

  it("inserts when no id provided and returns profile", async () => {
    const mockReturning = jest.fn().mockResolvedValue([{ id: "kyc_123", userId: "u1", firstName: "Alice" }]);

    const mockTx = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: mockReturning,
          }),
        }),
      }),
    };

    const context = createBaseContext({
      db: {
        transaction: jest.fn().mockImplementation((fn) => fn(mockTx)),
      },
    });

    const result = await handler({
      input: { userId: "u1", firstName: "Alice" },
      context,
      errors,
    });

    expect(result).toMatchObject({
      id: "kyc_123",
      userId: "u1",
      firstName: "Alice",
    });
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(mockTx.insert).toHaveBeenCalled();
  });

  it("updates existing profile and returns updated data", async () => {
    const mockReturning = jest.fn().mockResolvedValue([
      {
        id: "kyc_456",
        userId: "u2",
        firstName: "Bob",
        lastName: "Johnson",
      },
    ]);

    const mockTx = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: mockReturning,
          }),
        }),
      }),
    };

    const context = createBaseContext({
      db: {
        transaction: jest.fn().mockImplementation((fn) => fn(mockTx)),
      },
    });

    const result = await handler({
      input: {
        id: "kyc_456",
        userId: "u2",
        firstName: "Bob",
        lastName: "Johnson",
        dateOfBirth: "1985-05-15",
      },
      context,
      errors,
    });

    expect(result).toMatchObject({
      id: "kyc_456",
      userId: "u2",
      firstName: "Bob",
      lastName: "Johnson",
    });
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(mockTx.insert).toHaveBeenCalled();
  });

  it("throws INTERNAL_SERVER_ERROR when database operation fails", async () => {
    const mockTx = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockReturnValue({
            returning: jest.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      }),
    };

    const context = createBaseContext({
      db: {
        transaction: jest.fn().mockImplementation((fn) => fn(mockTx)),
      },
    });

    await expect(
      handler({
        input: { userId: "u3", firstName: "Charlie" },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("handles transaction rollback correctly", async () => {
    const mockTransaction = jest.fn().mockRejectedValue(new Error("Transaction failed"));

    const context = createBaseContext({
      db: {
        transaction: mockTransaction,
      },
    });

    await expect(
      handler({
        input: { userId: "u4", firstName: "Dave" },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });

    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });
});
