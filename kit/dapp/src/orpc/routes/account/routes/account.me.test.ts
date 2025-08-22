import { describe, expect, it, vi } from "vitest";
import {
  createBaseContext,
  createMockErrors,
  getCapturedAuthHandler,
  installAuthRouterCaptureMock,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";

// Partially mock @orpc/server to override only `call`
vi.mock("@orpc/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@orpc/server")>();
  return {
    ...actual,
    call: vi.fn((_route, _input, { context }) =>
      Promise.resolve({ id: context.auth.user.wallet })
    ),
  };
});

// Mock TheGraph module to avoid server-only init
vi.mock("@/lib/settlemint/the-graph", () => ({
  theGraphClient: { query: vi.fn() },
  theGraphGraphql: vi.fn(() => ({}) as unknown),
}));

// Avoid importing heavy middleware logic
vi.mock("@/orpc/middlewares/services/the-graph.middleware", () => ({
  theGraphMiddleware: () => undefined,
}));

// Avoid importing the heavy account.read module (brings auth middleware)
vi.mock("./account.read", () => ({
  read: {},
}));

installAuthRouterCaptureMock();

// Import route to register handler (after mocks)
import "./account.me";

describe("account.me (unit)", () => {
  it("returns null when no auth context", async () => {
    const handler = getCapturedAuthHandler() as OrpcHandler;
    const result = await handler({
      context: { theGraphClient: { query: vi.fn() } },
      input: undefined,
      errors: createMockErrors(),
    });
    expect(result).toBe(null);
  });

  it("returns account from nested read", async () => {
    const handler = getCapturedAuthHandler() as OrpcHandler;
    const ADDRESS = "0x1111111111111111111111111111111111111111" as const;
    const result = await handler({
      context: createBaseContext({ theGraphClient: { query: vi.fn() } }),
      input: undefined,
      errors: createMockErrors(),
    });
    expect(result).toEqual({ id: ADDRESS });
  });
});
