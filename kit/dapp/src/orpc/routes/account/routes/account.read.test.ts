import { describe, expect, it, vi } from "vitest";
import {
  createBaseContext,
  createMockErrors,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";

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

// Mock TheGraph module to avoid server-only init
vi.mock("@/lib/settlemint/the-graph", () => ({
  theGraphClient: { query: vi.fn() },
  theGraphGraphql: vi.fn(() => ({}) as unknown),
}));

// Avoid importing heavy middleware/auth logic
vi.mock("@/orpc/middlewares/auth/offchain-permissions.middleware", () => ({
  offChainPermissionsMiddleware: () => undefined,
}));
vi.mock("@/orpc/middlewares/services/the-graph.middleware", () => ({
  theGraphMiddleware: () => undefined,
}));

// Import route to register handler (after mocks)
import "./account.read";

describe("account.read (unit)", () => {
  it("returns account payload when found", async () => {
    const handler = publicState.handler as OrpcHandler;
    const ADDRESS = "0x1111111111111111111111111111111111111111" as const;

    const result = await handler({
      input: { wallet: ADDRESS },
      context: createBaseContext({
        theGraphClient: {
          query: vi.fn().mockResolvedValue({
            account: { id: ADDRESS, country: null, identity: null },
          }),
        },
      }),
      errors: createMockErrors(),
    });

    expect(result).toEqual({
      id: ADDRESS,
      country: undefined,
      identity: undefined,
      claims: [],
    });
  });

  it("throws Account not found when missing", async () => {
    const handler = publicState.handler as OrpcHandler;
    const ADDRESS = "0x2222222222222222222222222222222222222222" as const;

    await expect(
      handler({
        input: { wallet: ADDRESS },
        context: createBaseContext({
          theGraphClient: {
            query: vi.fn().mockResolvedValue({ account: null }),
          },
        }),
        errors: createMockErrors(),
      })
    ).rejects.toThrowError("Account not found");
  });
});
