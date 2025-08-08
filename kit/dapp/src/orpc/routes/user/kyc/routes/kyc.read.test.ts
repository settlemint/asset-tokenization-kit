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

import "./kyc.read";

function getHandler(): OrpcHandler {
  const handler = getCapturedAuthHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler;
}

describe("user.kyc.read unit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns profile when found", async () => {
    const handler = getHandler();
    const context = {
      auth: { user: { id: "u1" }, session: {} },
      db: {
        select: () => ({
          from: () => ({
            where: () => ({ limit: () => [{ id: "id1", userId: "u1" }] }),
          }),
        }),
      },
    } as unknown as {
      auth: unknown;
      db: { select: (arg?: unknown) => unknown };
    };

    const result = await handler({
      input: { userId: "u1" },
      context,
      errors: {},
    });
    expect(result).toMatchObject({ userId: "u1" });
  });

  it("throws NOT_FOUND when missing", async () => {
    const handler = getHandler();
    const context = {
      auth: { user: { id: "u1" }, session: {} },
      db: {
        select: () => ({
          from: () => ({ where: () => ({ limit: () => [] }) }),
        }),
      },
    } as unknown as {
      auth: unknown;
      db: { select: (arg?: unknown) => unknown };
    };

    await expect(
      handler({
        input: { userId: "u1" },
        context,
        errors: {
          NOT_FOUND: (p: { message: string }) => {
            throw Object.assign(new Error(p.message), { code: "NOT_FOUND" });
          },
        },
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
