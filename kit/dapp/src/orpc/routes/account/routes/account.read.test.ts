import {
  createBaseContext,
  createMockErrors,
  getCapturedAuthHandler,
  installAuthRouterCaptureMock,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";
import { describe, expect, it, vi } from "vitest";

installAuthRouterCaptureMock();

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
    const handler = getCapturedAuthHandler() as OrpcHandler;
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
      identityIsRegistered: false,
      claims: [],
    });
  });

  it("throws Account not found when missing", async () => {
    const handler = getCapturedAuthHandler() as OrpcHandler;
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
