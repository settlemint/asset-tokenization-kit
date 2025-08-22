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
import "./grant-role";

vi.mock("@/lib/settlemint/portal");
vi.mock("@/orpc/helpers/challenge-response", () => ({
  handleChallenge: vi.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" })
  ),
}));

installSystemRouterCaptureMock();

function getHandler(): OrpcHandler {
  const handler = getCapturedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler;
}

describe("system.access-manager.grant-role unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("single address, single role -> uses GRANT_ROLE mutation", async () => {
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

    expect(result).toEqual({
      addresses: ["0x1234567890123456789012345678901234567890"],
      roles: ["tokenManager"],
    });

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (context.portalClient.mutate as any).mock.calls[0];
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

  it("multiple addresses, single role -> uses BATCH_GRANT_ROLE mutation", async () => {
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
          "0x1111111111111111111111111111111111111111",
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

  it("single address, multiple roles -> uses GRANT_MULTIPLE_ROLES mutation", async () => {
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
});
