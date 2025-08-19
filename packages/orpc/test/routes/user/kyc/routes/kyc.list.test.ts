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

import "../../../../../../src/routes/user/kyc/routes/kyc.list";

function getHandler(): OrpcHandler {
  const handler = getAuthHandler();
  if (!handler) {
    throw new Error("Handler not captured - check mock setup");
  }
  return handler;
}

describe("KYC list", () => {
  const TEST_USER_1 = {
    email: `${randomUUID()}@test.com`,
    name: "KYC Test User 1",
    password: "settlemint",
  };

  const TEST_USER_2 = {
    email: `${randomUUID()}@test.com`,
    name: "KYC Test User 2",
    password: "settlemint",
  };

  let user1Data: Awaited<ReturnType<typeof getUserData>>;
  let user2Data: Awaited<ReturnType<typeof getUserData>>;

  beforeAll(async () => {
    // Setup test users
    await Promise.all([setupUser(TEST_USER_1), setupUser(TEST_USER_2)]);

    [user1Data, user2Data] = await Promise.all([getUserData(TEST_USER_1), getUserData(TEST_USER_2)]);

    // Create KYC profiles for test users
    const [headers1, headers2] = await Promise.all([signInWithUser(TEST_USER_1), signInWithUser(TEST_USER_2)]);
    const client1 = getTestOrpcClient(headers1);
    const client2 = getTestOrpcClient(headers2);

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
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

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
    const client = getTestOrpcClient(headers);

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
    const headers = await signInWithUser(TEST_USER_1);
    const client = getTestOrpcClient(headers);

    await expect(
      client.user.kyc.list({
        limit: 10,
        offset: 0,
        orderBy: "createdAt",
        orderDirection: "desc",
      })
    ).rejects.toThrow();
  });
});

describe("user.kyc.list unit", () => {
  let handler: OrpcHandler;
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    resetAllMocks();
    handler = getHandler();
    errors = createMockErrors();
  });

  it("paginates and orders correctly with search", async () => {
    const mockSelect = jest.fn();

    // Mock the count query and the items query separately
    const mockCountQuery = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ count: 2 }]),
      }),
    };

    const mockItemsQuery = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue([
                { id: "kyc_1", firstName: "John", lastName: "Doe" },
                { id: "kyc_2", firstName: "John", lastName: "Smith" },
              ]),
            }),
          }),
        }),
      }),
    };

    mockSelect
      .mockReturnValueOnce(mockCountQuery) // First call is for the count
      .mockReturnValueOnce(mockItemsQuery); // Second call is for the items

    const context = createBaseContext({
      db: { select: mockSelect },
    });

    const result = (await handler({
      input: {
        limit: 10,
        offset: 0,
        orderDirection: "asc",
        orderBy: "createdAt",
        search: "John",
      },
      context,
      errors,
    })) as { total: number; items: unknown[] };

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(mockSelect).toHaveBeenCalledTimes(2);

    // Verify the queries were structured correctly
    expect(mockCountQuery.from).toHaveBeenCalled();
    expect(mockItemsQuery.from).toHaveBeenCalled();
  });

  it("handles empty results correctly", async () => {
    const mockSelect = jest.fn();

    const mockCountQuery = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ count: 0 }]),
      }),
    };

    const mockItemsQuery = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    };

    mockSelect.mockReturnValueOnce(mockCountQuery).mockReturnValueOnce(mockItemsQuery);

    const context = createBaseContext({
      db: { select: mockSelect },
    });

    const result = (await handler({
      input: {
        limit: 10,
        offset: 0,
        orderDirection: "desc",
        orderBy: "updatedAt",
      },
      context,
      errors,
    })) as { total: number; items: unknown[] };

    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(mockSelect).toHaveBeenCalledTimes(2);
  });

  it("applies pagination parameters correctly", async () => {
    const mockSelect = jest.fn();

    const mockCountQuery = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ count: 100 }]),
      }),
    };

    const mockItemsQuery = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue([
                { id: "kyc_21", firstName: "Alice", lastName: "Johnson" },
                { id: "kyc_22", firstName: "Bob", lastName: "Wilson" },
              ]),
            }),
          }),
        }),
      }),
    };

    mockSelect.mockReturnValueOnce(mockCountQuery).mockReturnValueOnce(mockItemsQuery);

    const context = createBaseContext({
      db: { select: mockSelect },
    });

    const result = (await handler({
      input: {
        limit: 2,
        offset: 20,
        orderDirection: "asc",
        orderBy: "firstName",
      },
      context,
      errors,
    })) as { total: number; items: unknown[] };

    expect(result.total).toBe(100);
    expect(result.items).toHaveLength(2);

    // Verify limit and offset were applied
    const itemsQueryChain = mockItemsQuery.from().where().orderBy().limit();
    expect(itemsQueryChain.offset).toHaveBeenCalled();
  });

  it("handles database errors appropriately", async () => {
    const mockSelect = jest.fn();

    const mockCountQuery = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockRejectedValue(new Error("Database error")),
      }),
    };

    mockSelect.mockReturnValueOnce(mockCountQuery);

    const context = createBaseContext({
      db: { select: mockSelect },
    });

    await expect(
      handler({
        input: {
          limit: 10,
          offset: 0,
        },
        context,
        errors,
      })
    ).rejects.toThrowError("Database error");

    expect(mockSelect).toHaveBeenCalledTimes(1);
  });
});
