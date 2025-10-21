/**
 * @vitest-environment node
 */
import {
  createBaseContext,
  createMockErrors,
  getCapturedHandler,
  installSystemRouterCaptureMock,
  OrpcHandler,
} from "@/test/orpc-route-helpers";
import { VerificationType } from "@atk/zod/verification-type";
import { DEFAULT_PINCODE } from "@test/fixtures/user";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "./topic.create";
import type {
  TopicCreateInput,
  TopicCreateOutput,
} from "./topic.create.schema";

vi.mock("@/lib/settlemint/portal");
vi.mock("@/orpc/helpers/challenge-response", () => ({
  handleChallenge: vi.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" })
  ),
}));

installSystemRouterCaptureMock();

function getHandler(): OrpcHandler<TopicCreateInput, TopicCreateOutput> {
  const handler = getCapturedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler as OrpcHandler<TopicCreateInput, TopicCreateOutput>;
}

describe("system.claim-topics.topic.create unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("creates topic with valid input and permissions", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        topicSchemeRegistry: {
          id: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        },
      },
    });

    // Mock successful portal mutation
    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );

    const input: TopicCreateInput = {
      name: "KYC Verification",
      signature: "isKYCVerified(address,bytes32)",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
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
      name: "KYC Verification",
    });

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("RegisterTopicSchemeMutation"), // The GraphQL mutation
      {
        address: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        from: context.auth.user.wallet,
        name: "KYC Verification",
        signature: "isKYCVerified(address,bytes32)",
      },
      {
        sender: context.auth.user,
        code: DEFAULT_PINCODE,
        type: VerificationType.pincode,
      }
    );
  });

  it("creates topic with different valid signature format", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        topicSchemeRegistry: {
          id: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        },
      },
    });

    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
      );

    const input: TopicCreateInput = {
      name: "Age Verification",
      signature: "isOver18(address)",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
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
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      name: "Age Verification",
    });
  });

  it("handles portal client mutation errors", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        topicSchemeRegistry: {
          id: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        },
      },
    });

    // Mock portal mutation failure
    const portalError = new Error("Transaction failed");
    context.portalClient.mutate = vi.fn().mockRejectedValue(portalError);

    const input: TopicCreateInput = {
      name: "Test Topic",
      signature: "testFunction(address)",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
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

  it("creates multiple topics with different names successfully", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        topicSchemeRegistry: {
          id: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        },
      },
    });

    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );

    const walletVerification = {
      secretVerificationCode: "123456",
      verificationType: VerificationType.pincode,
    };

    const testCases = [
      { name: "KYC", signature: "isKYC(address)", walletVerification },
      {
        name: "AML Check",
        signature: "isAMLCompliant(address,uint256)",
        walletVerification,
      },
      {
        name: "Investor Status",
        signature: "isAccreditedInvestor(address)",
        walletVerification,
      },
    ];

    for (const testCase of testCases) {
      const result = await handler({
        input: testCase,
        context,
        errors,
      });

      expect(result.name).toBe(testCase.name);
      expect(result.txHash).toBe(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );
    }
  });

  it("calls portal client with correct GraphQL variables", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        topicSchemeRegistry: {
          id: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        },
      },
      auth: {
        user: {
          id: "user_2",
          wallet: "0x2222222222222222222222222222222222222222",
        },
        session: {
          id: "sess_2",
        },
      },
    });

    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
      );

    const input: TopicCreateInput = {
      name: "Credit Score",
      signature: "getCreditScore(address,uint256)",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: VerificationType.pincode,
      },
    };

    await handler({
      input,
      context,
      errors,
    });

    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("RegisterTopicSchemeMutation"), // GraphQL mutation document
      {
        address: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        from: "0x2222222222222222222222222222222222222222",
        name: "Credit Score",
        signature: "getCreditScore(address,uint256)",
      },
      {
        sender: context.auth.user,
        code: DEFAULT_PINCODE,
        type: VerificationType.pincode,
      }
    );
  });
});
