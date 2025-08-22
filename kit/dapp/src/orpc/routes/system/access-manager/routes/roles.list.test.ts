/**
 * @vitest-environment node
 */

import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createBaseContext,
  createMockErrors,
  getCapturedOnboardedHandler,
  installOnboardedRouterCaptureMock,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";

installOnboardedRouterCaptureMock();
import "./roles.list";

function getHandler(): OrpcHandler<
  { excludeContracts?: boolean },
  Array<{ account: string; roles: string[] }>
> {
  const handler = getCapturedOnboardedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler as OrpcHandler<
    { excludeContracts?: boolean },
    Array<{ account: string; roles: string[] }>
  >;
}

describe("system.access-manager.roles.list unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("returns empty array when no access control", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: { systemAccessManager: { id: "0x0", accessControl: undefined } },
    });
    const result = await handler({
      input: { excludeContracts: false },
      context,
      errors,
    });
    expect(result).toEqual([]);
  });

  it("groups roles per account and filters contracts when requested", async () => {
    const handler = getHandler();
    const accessControl = {
      id: "system",
      admin: [
        { id: "0xaaaaa00000000000000000000000000000000000", isContract: false },
        { id: "0xccccc00000000000000000000000000000000000", isContract: true },
      ],
      tokenManager: [
        { id: "0xaaaaa00000000000000000000000000000000000", isContract: false },
        { id: "0xbbbbb00000000000000000000000000000000000", isContract: false },
      ],
    };

    const context = createBaseContext({
      system: { systemAccessManager: { id: "0x0", accessControl } },
    });

    const all = (await handler({
      input: { excludeContracts: false },
      context,
      errors,
    })) as Array<{
      account: string;
      roles: string[];
    }>;
    const filtered = (await handler({
      input: { excludeContracts: true },
      context,
      errors,
    })) as Array<{
      account: string;
      roles: string[];
    }>;

    expect(all).toEqual(
      expect.arrayContaining([
        {
          account: getEthereumAddress(
            "0xaaaaa00000000000000000000000000000000000"
          ),
          roles: expect.arrayContaining(["admin", "tokenManager"]),
        },
        {
          account: getEthereumAddress(
            "0xbbbbb00000000000000000000000000000000000"
          ),
          roles: ["tokenManager"],
        },
        {
          account: getEthereumAddress(
            "0xccccc00000000000000000000000000000000000"
          ),
          roles: ["admin"],
        },
      ])
    );

    expect(filtered).toEqual(
      expect.arrayContaining([
        {
          account: getEthereumAddress(
            "0xaaaaa00000000000000000000000000000000000"
          ),
          roles: expect.arrayContaining(["admin", "tokenManager"]),
        },
        {
          account: getEthereumAddress(
            "0xbbbbb00000000000000000000000000000000000"
          ),
          roles: ["tokenManager"],
        },
      ])
    );
    expect(
      filtered.find(
        (r) =>
          r.account ===
          getEthereumAddress("0xccccc00000000000000000000000000000000000")
      )
    ).toBeUndefined();
  });
});
