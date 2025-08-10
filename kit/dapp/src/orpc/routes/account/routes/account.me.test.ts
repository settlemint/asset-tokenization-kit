import { describe, expect, it, vi } from "vitest";
import {
  createBaseContext,
  createMockErrors,
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

// Capture public router handler locally
const publicState = vi.hoisted(() => ({
  handler: undefined as OrpcHandler | undefined,
}));

vi.mock("@/orpc/procedures/public.router", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builderTarget: Record<string, unknown> = {} as any;
  const builderProxy: unknown = new Proxy(builderTarget, {
    get(_t, _prop: string): unknown {
      const chain = new Proxy(
        {},
        {
          get(_t2, prop2: string): unknown {
            if (prop2 === "use") return () => chain;
            if (prop2 === "handler")
              return (fn: OrpcHandler) => {
                publicState.handler = fn;
                return chain;
              };
            return chain;
          },
        }
      );
      return chain;
    },
  });
  return { publicRouter: builderProxy as Record<string, unknown> };
});

// Import route to register handler (after mocks)
import "./account.me";

describe("account.me (unit)", () => {
  it("throws UNAUTHORIZED when no auth context", async () => {
    const handler = publicState.handler as OrpcHandler;
    await expect(
      handler({
        context: { theGraphClient: { query: vi.fn() } },
        input: undefined,
        errors: createMockErrors(),
      })
    ).rejects.toThrowError(/UNAUTHORIZED/);
  });

  it("returns account from nested read", async () => {
    const handler = publicState.handler as OrpcHandler;
    const ADDRESS = "0x1111111111111111111111111111111111111111" as const;
    const result = await handler({
      context: createBaseContext({ theGraphClient: { query: vi.fn() } }),
      input: undefined,
      errors: createMockErrors(),
    });
    expect(result).toEqual({ id: ADDRESS });
  });
});
