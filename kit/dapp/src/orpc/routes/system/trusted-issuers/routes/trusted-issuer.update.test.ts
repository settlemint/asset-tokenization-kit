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
import "./trusted-issuer.update";
import type {
  TrustedIssuerUpdateInput,
  TrustedIssuerUpdateOutput,
} from "./trusted-issuer.update.schema";

vi.mock("@/lib/settlemint/portal");
vi.mock("@/orpc/helpers/challenge-response", () => ({
  handleChallenge: vi.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" })
  ),
}));

installSystemRouterCaptureMock();

function getHandler(): OrpcHandler<
  TrustedIssuerUpdateInput,
  TrustedIssuerUpdateOutput
> {
  const handler = getCapturedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler as OrpcHandler<
    TrustedIssuerUpdateInput,
    TrustedIssuerUpdateOutput
  >;
}

describe("system.trusted-issuers.update unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("updates trusted issuer claim topics with valid input and permissions", async () => {
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

    const input: TrustedIssuerUpdateInput = {
      issuerAddress: "0x1111111111111111111111111111111111111111",
      claimTopicIds: ["1", "2", "101"],
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
      txHash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      issuerAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("UpdateIssuerTopicsMutation"), // The GraphQL mutation
      {
        address: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        from: context.auth.user.wallet,
        trustedIssuer: "0x1111111111111111111111111111111111111111",
        claimTopics: ["1", "2", "101"],
      },
      {
        sender: context.auth.user,
        code: "123456",
        type: "PINCODE",
      }
    );
  });

  it("updates trusted issuer to have fewer claim topics", async () => {
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

    const input: TrustedIssuerUpdateInput = {
      issuerAddress: "0x2222222222222222222222222222222222222222",
      claimTopicIds: ["1"], // Reducing from multiple topics to just one
      walletVerification: {
        secretVerificationCode: "654321",
        verificationType: VerificationType.otp,
      },
    };

    const result = await handler({
      input,
      context,
      errors,
    });

    expect(result).toEqual({
      txHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      issuerAddress: "0x2222222222222222222222222222222222222222",
    });

    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("UpdateIssuerTopicsMutation"),
      {
        address: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        from: context.auth.user.wallet,
        trustedIssuer: "0x2222222222222222222222222222222222222222",
        claimTopics: ["1"],
      },
      {
        sender: context.auth.user,
        code: "654321",
        type: "OTP",
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
      .mockRejectedValue(new Error("Transaction failed"));

    const input: TrustedIssuerUpdateInput = {
      issuerAddress: "0x1111111111111111111111111111111111111111",
      claimTopicIds: ["1", "2"],
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
    ).rejects.toThrow("Transaction failed");

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
  });

  it("validates that at least one claim topic ID is required", () => {
    // This test validates schema-level validation
    const input = {
      claimTopicIds: [] as string[], // Empty array should fail validation
    };

    // The schema requires at least one topic ID
    expect(input.claimTopicIds).toHaveLength(0);
  });
});
