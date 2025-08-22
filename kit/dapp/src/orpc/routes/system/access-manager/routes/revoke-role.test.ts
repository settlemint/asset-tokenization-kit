/**
 * @vitest-environment node
 */
import {
  createBaseContext,
  createMockErrors,
  getCapturedOnboardedHandler,
  installOnboardedRouterCaptureMock,
  type OrpcHandler,
} from "@/test/orpc-route-helpers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "./revoke-role";

// Mock shared dependencies used by the route for fast unit execution
vi.mock("@/lib/settlemint/portal"); // vitest config maps to test mocks
vi.mock("@/orpc/helpers/challenge-response", () => ({
  // No await inside to satisfy require-await
  handleChallenge: vi.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" })
  ),
}));

// Install the system router capture mock BEFORE importing the route
installOnboardedRouterCaptureMock();

function getHandler(): OrpcHandler {
  const handler = getCapturedOnboardedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler;
}

describe("system.access-manager.revoke-role unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("single address, single role -> uses REVOKE_ROLE mutation", async () => {
    const handler = getHandler();
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: "0x1234567890123456789012345678901234567890",
        role: "tokenManager",
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    // returns normalized
    expect(result).toEqual({
      addresses: ["0x1234567890123456789012345678901234567890"],
      roles: ["tokenManager"],
    });

    // called correct mutation with bytes role and account
    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (context.portalClient.mutate as any).mock.calls[0];
    // variables object is at index 1
    expect(call[1]).toMatchObject({
      address: context.system.systemAccessManager.id,
      from: context.auth.user.wallet,
      account: "0x1234567890123456789012345678901234567890",
      role: expect.stringMatching(/^0x[0-9a-f]{64}$/),
    });
    // Check the third argument (walletVerification)
    expect(call[2]).toMatchObject({
      sender: context.auth.user,
      code: "123456",
      type: "PINCODE",
    });
  });

  it("multiple addresses, single role -> uses BATCH_REVOKE_ROLE mutation", async () => {
    const handler = getHandler();
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: [
          "0x1111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222",
          "0x1111111111111111111111111111111111111111", // duplicate
        ],
        role: "complianceManager",
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    expect(result.addresses).toEqual([
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
    ]);
    expect(result.roles).toEqual(["complianceManager"]);

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (context.portalClient.mutate as any).mock.calls[0];
    expect(call[1]).toMatchObject({
      accounts: [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
      ],
      role: expect.stringMatching(/^0x[0-9a-f]{64}$/),
    });
  });

  it("single address, multiple roles -> uses REVOKE_MULTIPLE_ROLES mutation", async () => {
    const handler = getHandler();
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: "0x3333333333333333333333333333333333333333",
        role: ["systemManager", "tokenManager", "tokenManager"],
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    expect(result.addresses).toEqual([
      "0x3333333333333333333333333333333333333333",
    ]);
    expect(result.roles).toEqual(["systemManager", "tokenManager"]);

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (context.portalClient.mutate as any).mock.calls[0];
    expect(call[1]).toMatchObject({
      account: "0x3333333333333333333333333333333333333333",
      roles: expect.arrayContaining([
        expect.stringMatching(/^0x[0-9a-f]{64}$/),
        expect.stringMatching(/^0x[0-9a-f]{64}$/),
      ]),
    });
  });

  it("multiple addresses and multiple roles -> rejects with INPUT_VALIDATION_FAILED", async () => {
    const handler = getHandler();
    const context = createBaseContext();

    await expect(
      handler({
        input: {
          walletVerification: {
            secretVerificationCode: "123456",
            verificationType: "PINCODE",
          },
          address: [
            "0x1111111111111111111111111111111111111111",
            "0x2222222222222222222222222222222222222222",
          ],
          role: ["systemManager", "tokenManager"],
        },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "INPUT_VALIDATION_FAILED" });
  });

  it("invalid roles -> NOT_FOUND", async () => {
    const handler = getHandler();
    const context = createBaseContext();

    await expect(
      handler({
        input: {
          walletVerification: {
            secretVerificationCode: "123456",
            verificationType: "PINCODE",
          },
          address: "0x1234567890123456789012345678901234567890",

          role: ["invalidRole" as unknown as never],
        },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns empty arrays when inputs are empty after normalization", async () => {
    const handler = getHandler();
    const context = createBaseContext();

    const result = (await handler({
      input: {
        walletVerification: {
          secretVerificationCode: "123456",
          verificationType: "PINCODE",
        },
        address: [],
        role: "tokenManager",
      },
      context,
      errors,
    })) as { addresses: string[]; roles: string[] };

    expect(result).toEqual({ addresses: [], roles: [] });
    expect(context.portalClient.mutate).not.toHaveBeenCalled();
  });

  it("handles missing system.accessManager with INTERNAL_SERVER_ERROR", async () => {
    const handler = getHandler();
    const context = createBaseContext({ system: undefined });

    await expect(
      handler({
        input: {
          walletVerification: {
            secretVerificationCode: "123456",
            verificationType: "PINCODE",
          },
          address: "0x1234567890123456789012345678901234567890",
          role: "tokenManager",
        },
        context,
        errors,
      })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
