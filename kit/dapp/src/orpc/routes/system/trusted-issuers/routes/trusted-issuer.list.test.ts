/**
 * @vitest-environment node
 */

import {
  createBaseContext,
  createMockErrors,
  getCapturedHandler,
  installSystemRouterCaptureMock,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";
import { beforeEach, describe, expect, it, vi } from "vitest";

installSystemRouterCaptureMock();
import "./trusted-issuer.list";
import type { TrustedIssuerListOutput } from "./trusted-issuer.list.schema";

function getHandler(): OrpcHandler<void, TrustedIssuerListOutput> {
  const handler = getCapturedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler as OrpcHandler<void, TrustedIssuerListOutput>;
}

describe("system.trusted-issuers.list unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("returns empty array when no trusted issuers exist", async () => {
    const handler = getHandler();

    const mockTheGraphClient = {
      query: vi.fn().mockResolvedValue({
        trustedIssuers: [],
      }),
    };

    const context = createBaseContext({
      system: {
        trustedIssuersRegistry: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
      },
      theGraphClient: mockTheGraphClient,
    });

    const result = await handler({
      input: undefined,
      context,
      errors,
    });

    expect(result).toEqual([]); // Verify empty array result
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(mockTheGraphClient.query).toHaveBeenCalledWith(
      expect.any(Object), // GraphQL document object
      {
        input: {
          registryAddress: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        },
        output: expect.any(Object), // Zod schema object
      }
    );
  });

  it("returns list of trusted issuers with their claim topics", async () => {
    const handler = getHandler();

    const mockTrustedIssuers = [
      {
        id: "0x1111111111111111111111111111111111111111",
        deployedInTransaction: "0xabc123",
        claimTopics: [
          {
            id: "0xtopic1",
            topicId: "1",
            name: "kyc",
            signature: "isKYCVerified(address,bytes32)",
          },
          {
            id: "0xtopic2",
            topicId: "2",
            name: "aml",
            signature: "isAMLCleared(address)",
          },
        ],
      },
      {
        id: "0x2222222222222222222222222222222222222222",
        deployedInTransaction: "0xdef456",
        claimTopics: [
          {
            id: "0xtopic101",
            topicId: "101",
            name: "accreditation",
            signature: "isAccredited(address,string)",
          },
        ],
      },
    ];

    const mockTheGraphClient = {
      query: vi.fn().mockResolvedValue({
        trustedIssuers: mockTrustedIssuers,
      }),
    };

    const context = createBaseContext({
      system: {
        trustedIssuersRegistry: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
      },
      theGraphClient: mockTheGraphClient,
    });

    const result = await handler({
      input: undefined,
      context,
      errors,
    });

    expect(result).toEqual(mockTrustedIssuers);
    expect(mockTheGraphClient.query).toHaveBeenCalledTimes(1);
  });

  it("throws INTERNAL_SERVER_ERROR when trusted issuers registry is not configured", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        trustedIssuersRegistry: undefined,
      },
    });

    await expect(
      handler({
        input: undefined,
        context,
        errors,
      })
    ).rejects.toThrow("System trusted issuers registry not found");
  });

  it("handles TheGraph query failures gracefully", async () => {
    const handler = getHandler();

    const mockTheGraphClient = {
      query: vi.fn().mockRejectedValue(new Error("Network error")),
    };

    const context = createBaseContext({
      system: {
        trustedIssuersRegistry: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
      },
      theGraphClient: mockTheGraphClient,
    });

    await expect(
      handler({
        input: undefined,
        context,
        errors,
      })
    ).rejects.toThrow("Network error");

    expect(mockTheGraphClient.query).toHaveBeenCalledTimes(1);
  });
});
