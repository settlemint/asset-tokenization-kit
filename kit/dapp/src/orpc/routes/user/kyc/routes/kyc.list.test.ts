/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type OrpcHandler,
  installAuthRouterCaptureMock,
  getCapturedAuthHandler,
} from "@/test/orpc-route-helpers";

installAuthRouterCaptureMock();
vi.mock("@/orpc/middlewares/auth/offchain-permissions.middleware", () => ({
  offChainPermissionsMiddleware: () => ({ use: () => ({}) }),
}));
vi.mock("@/orpc/middlewares/services/db.middleware", () => ({
  databaseMiddleware: ({
    next,
  }: {
    next: (arg: { context: Record<string, unknown> }) => unknown;
  }) => next({ context: {} as Record<string, unknown> }),
}));

import "./kyc.list";

function getHandler(): OrpcHandler {
  const handler = getCapturedAuthHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler;
}

describe("user.kyc.list unit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("paginates and orders correctly with search", async () => {
    const handler = getHandler();
    const mockSelect = vi.fn();
    const context = {
      auth: { user: { id: "admin" }, session: {} },
      db: { select: mockSelect },
    } as unknown as {
      auth: unknown;
      db: { select: (arg?: unknown) => unknown };
    };

    // Mock the count query and the items query separately
    const mockCountQuery = {
      from: () => ({ where: () => [{ count: 2 }] }),
    };
    const mockItemsQuery = {
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => ({ offset: () => [{ id: "1" }, { id: "2" }] }),
          }),
        }),
      }),
    };

    mockSelect
      .mockReturnValueOnce(mockCountQuery) // First call is for the count
      .mockReturnValueOnce(mockItemsQuery); // Second call is for the items

    const result = (await handler({
      input: {
        limit: 10,
        offset: 0,
        orderDirection: "asc",
        orderBy: "createdAt",
        search: "John",
      },
      context,
      errors: {},
    })) as { total: number; items: unknown[] };

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(mockSelect).toHaveBeenCalledTimes(2);
  });
});
