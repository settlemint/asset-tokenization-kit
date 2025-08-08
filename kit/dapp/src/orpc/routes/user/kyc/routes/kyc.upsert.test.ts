/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
// Mock generateId from better-auth used by route
vi.mock("better-auth", () => ({ generateId: () => "gen_123" }));

import {
  type OrpcHandler,
  installAuthRouterCaptureMock,
  getCapturedAuthHandler,
} from "@/test/orpc-route-helpers";

// Capture auth router chain to intercept handler
installAuthRouterCaptureMock();

// Mock permission and db middlewares to no-op and pass through
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

// Inject a minimal chain supporting .use().use().handler() and capture final handler
import "./kyc.upsert";

function getHandler(): OrpcHandler {
  const handler = getCapturedAuthHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler;
}

describe("user.kyc.upsert unit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts when no id provided and returns profile", async () => {
    const handler = getHandler();

    // Mocking functions are used in the mockTx object below
    const mockReturning = vi
      .fn()
      .mockResolvedValueOnce([{ id: "id1", userId: "u1", firstName: "A" }]);
    const mockTx = {
      insert: () => ({
        values: () => ({
          onConflictDoUpdate: () => ({ returning: mockReturning }),
        }),
      }),
    } as unknown as { insert: (table?: unknown) => unknown };
    const context = {
      auth: { user: { id: "u1" }, session: {} },
      db: { transaction: (fn: (tx: unknown) => unknown) => fn(mockTx) },
    };

    const result = await handler({
      input: { userId: "u1", firstName: "A" },
      context,
      errors: {
        INTERNAL_SERVER_ERROR: (p: { message: string }) => {
          throw Object.assign(new Error(p.message), {
            code: "INTERNAL_SERVER_ERROR",
          });
        },
      },
    });

    expect(result).toMatchObject({ id: "id1", userId: "u1", firstName: "A" });
    expect(mockReturning).toHaveBeenCalledTimes(1);
  });
});
