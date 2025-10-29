import {
  createBaseContext,
  createMockErrors,
  getCapturedAuthHandler,
  installAuthRouterCaptureMock,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";
import { describe, expect, it, vi } from "vitest";

// Capture auth router handler
installAuthRouterCaptureMock();

// Explicitly mock TheGraph module to avoid server-only init
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
vi.mock("@/orpc/routes/system/identity/routes/identity.read", () => ({
  identityRead: vi.fn(() => ({
    account: {
      id: "0x1111111111111111111111111111111111111111",
      contractName: "UnitTestContract",
    },
  })),
}));
vi.mock("@/orpc/routes/user/routes/user.read", () => ({
  read: vi.fn(() => ({
    id: "0x1111111111111111111111111111111111111111",
    name: "UnitTestUser",
  })),
}));

// Import route to register handler with mocked router
// oxlint-disable-next-line no-unassigned-import
import "./account.search";

describe("account.search (unit)", () => {
  it("returns empty array for non-address queries", async () => {
    const handler = getCapturedAuthHandler() as OrpcHandler;
    const res = await handler({
      input: { query: "not-an-address", limit: 10 },
      context: createBaseContext({ theGraphClient: { query: vi.fn() } }),
      errors: createMockErrors(),
    });
    expect(res).toEqual([]);
  });

  it("returns account with contractName when found", async () => {
    const ADDRESS = "0x1111111111111111111111111111111111111111" as const;
    const handler = getCapturedAuthHandler() as OrpcHandler;

    const query = vi.fn().mockResolvedValue({
      account: {
        id: ADDRESS,
        isContract: true,
        contractName: "UnitTestContract",
      },
    });

    const result = await handler({
      input: { query: ADDRESS, limit: 1 },
      context: createBaseContext({ theGraphClient: { query } }),
      errors: createMockErrors(),
    });

    expect(query).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: ADDRESS,
        isContract: true,
        contractName: "UnitTestContract",
        displayName: "UnitTestContract",
      },
    ]);
  });
});
