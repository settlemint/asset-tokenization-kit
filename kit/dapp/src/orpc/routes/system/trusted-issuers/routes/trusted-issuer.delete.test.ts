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
import { VerificationType } from "@atk/zod/verification-type";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "./trusted-issuer.delete";
import type {
  TrustedIssuerDeleteInput,
  TrustedIssuerDeleteOutput,
} from "./trusted-issuer.delete.schema";

vi.mock("@/lib/settlemint/portal");
vi.mock("@/orpc/helpers/challenge-response", () => ({
  handleChallenge: vi.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" })
  ),
}));

installSystemRouterCaptureMock();

function getHandler(): OrpcHandler<
  TrustedIssuerDeleteInput,
  TrustedIssuerDeleteOutput
> {
  const handler = getCapturedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler as OrpcHandler<
    TrustedIssuerDeleteInput,
    TrustedIssuerDeleteOutput
  >;
}

describe("system.trusted-issuers.delete unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("deletes trusted issuer with valid input and permissions", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        trustedIssuersRegistry: {
          id: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        },
      },
    });

    // Mock successful portal mutation
    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );

    const input: TrustedIssuerDeleteInput = {
      issuerAddress: "0x1111111111111111111111111111111111111111",
      walletVerification: {
        secretVerificationCode: "123456",
        verificationType: VerificationType.pincode,
      },
    };

    const result = await handler({
      input,
      context,
      errors,
    });

    expect(result).toEqual({
      transactionHash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      issuerAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("RemoveTrustedIssuerMutation"), // The GraphQL mutation
      {
        address: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        from: context.auth.user.wallet,
        trustedIssuer: "0x1111111111111111111111111111111111111111",
      },
      {
        sender: context.auth.user,
        code: "123456",
        type: "PINCODE",
      }
    );
  });

  it("deletes trusted issuer with different verification type", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        trustedIssuersRegistry: {
          id: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        },
      },
    });

    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
      );

    const input: TrustedIssuerDeleteInput = {
      issuerAddress: "0x2222222222222222222222222222222222222222",
      walletVerification: {
        secretVerificationCode: "654321",
        verificationType: VerificationType.secretCodes,
      },
    };

    const result = await handler({
      input,
      context,
      errors,
    });

    expect(result).toEqual({
      transactionHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      issuerAddress: "0x2222222222222222222222222222222222222222",
    });

    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("RemoveTrustedIssuerMutation"),
      {
        address: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        from: context.auth.user.wallet,
        trustedIssuer: "0x2222222222222222222222222222222222222222",
      },
      {
        sender: context.auth.user,
        code: "654321",
        type: "SECRET_CODES",
      }
    );
  });

  it("handles portal mutation failures", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        trustedIssuersRegistry: {
          id: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        },
      },
    });

    // Mock portal mutation failure
    context.portalClient.mutate = vi
      .fn()
      .mockRejectedValue(new Error("Transaction reverted"));

    const input: TrustedIssuerDeleteInput = {
      issuerAddress: "0x1111111111111111111111111111111111111111",
      walletVerification: {
        secretVerificationCode: "123456",
        verificationType: VerificationType.pincode,
      },
    };

    await expect(
      handler({
        input,
        context,
        errors,
      })
    ).rejects.toThrow("Transaction reverted");

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
  });

  it("handles issuer that doesn't exist in registry", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        trustedIssuersRegistry: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
      },
    });

    // Mock portal mutation that simulates trying to remove non-existent issuer
    context.portalClient.mutate = vi
      .fn()
      .mockRejectedValue(new Error("TrustedIssuer: not found"));

    const input: TrustedIssuerDeleteInput = {
      issuerAddress: "0x9999999999999999999999999999999999999999", // Non-existent issuer
      walletVerification: {
        secretVerificationCode: "123456",
        verificationType: VerificationType.pincode,
      },
    };

    await expect(
      handler({
        input,
        context,
        errors,
      })
    ).rejects.toThrow("TrustedIssuer: not found");

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
  });
});
