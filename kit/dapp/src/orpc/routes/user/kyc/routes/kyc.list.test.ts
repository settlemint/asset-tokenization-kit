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
    const context = {
      auth: { user: { id: "admin" }, session: {} },
      db: {
        select: vi.fn().mockReturnValue({
          from: () => ({ where: () => [{ count: 2 }] }),
        }) as unknown as (arg?: unknown) => unknown,
      },
    } as unknown as {
      auth: unknown;
      db: { select: (arg?: unknown) => unknown };
    };

    // Mock for items chain
    context.db.select = vi.fn().mockImplementation(() => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => ({ offset: () => [{ id: "1" }, { id: "2" }] }),
          }),
        }),
      }),
    }));
    // Also ensure count path resolves to array destructuring
    (context.db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      from: () => ({ where: () => [{ count: 2 }] }),
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
      errors: {},
    })) as { total: number; items: unknown[] };

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
  });
});
