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

import "../../../../../../src/routes/user/kyc/routes/kyc.read";

function getHandler(): OrpcHandler {
  const handler = getAuthHandler();
  if (!handler) {
    throw new Error("Handler not captured - check mock setup");
  }
  return handler;
}

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

    [testUserData, otherUserData] = await Promise.all([getUserData(TEST_USER), getUserData(OTHER_USER)]);

    // Create KYC profiles for both users
    const [headers, otherHeaders] = await Promise.all([signInWithUser(TEST_USER), signInWithUser(OTHER_USER)]);
    const client = getTestOrpcClient(headers);
    const otherClient = getTestOrpcClient(otherHeaders);

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
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

    await expect(
      client.user.kyc.read({
        userId: otherUserData.id,
      })
    ).rejects.toThrow();
  });

  it("throws NOT_FOUND when reading non-existent KYC profile", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

    const profile = await client.user.kyc.read({
      userId: otherUserData.id,
    });

    expect(profile).toBeDefined();
    expect(profile.userId).toBe(otherUserData.id);
    expect(profile.firstName).toBe("Bob");
    expect(profile.lastName).toBe("Wilson");
  });
});

describe("user.kyc.read unit", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    handler = getHandler();
    errors = createMockErrors();
  });

  it("returns profile when found", async () => {
    const mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: "id1", userId: "u1", firstName: "John", lastName: "Doe" }]),
          }),
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

    expect(result).toMatchObject({
      id: "id1",
      userId: "u1",
      firstName: "John",
      lastName: "Doe",
    });
    expect(mockDb.select).toHaveBeenCalled();
  });

  it("throws NOT_FOUND when missing", async () => {
    const mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]), // Empty result
          }),
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

    expect(mockDb.select).toHaveBeenCalled();
  });

  it("handles database query correctly", async () => {
    const mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                id: "kyc_123",
                userId: "user_456",
                firstName: "Alice",
                lastName: "Smith",
                dateOfBirth: "1990-01-01",
                nationality: "US",
              },
            ]),
          }),
        }),
      }),
    };

    const context = createBaseContext({
      db: mockDb,
    });

    const result = await handler({
      input: { userId: "user_456" },
      context,
      errors,
    });

    expect(result).toMatchObject({
      id: "kyc_123",
      userId: "user_456",
      firstName: "Alice",
      lastName: "Smith",
      dateOfBirth: "1990-01-01",
      nationality: "US",
    });

    // Verify the database query was constructed correctly
    const queryBuilder = mockDb.select();
    expect(queryBuilder.from).toHaveBeenCalled();
    expect(queryBuilder.from().where).toHaveBeenCalled();
    expect(queryBuilder.from().where().limit).toHaveBeenCalledWith(1);
  });
});
