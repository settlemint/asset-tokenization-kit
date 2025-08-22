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
import "./topic.delete";
import type {
  TopicDeleteInput,
  TopicDeleteOutput,
} from "./topic.delete.schema";

vi.mock("@/lib/settlemint/portal");
vi.mock("@/orpc/helpers/challenge-response", () => ({
  handleChallenge: vi.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" })
  ),
}));

installSystemRouterCaptureMock();

function getHandler(): OrpcHandler<TopicDeleteInput, TopicDeleteOutput> {
  const handler = getCapturedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler as OrpcHandler<TopicDeleteInput, TopicDeleteOutput>;
}

describe("system.claim-topics.topic.delete unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("deletes topic with valid input and permissions", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        topicSchemeRegistry: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
      },
    });

    // Mock successful portal mutation
    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );

    const input: TopicDeleteInput = {
      name: "KYC Verification",
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
      name: "KYC Verification",
    });

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("RemoveTopicSchemeMutation"), // The GraphQL mutation
      {
        address: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        from: context.auth.user.wallet,
        name: "KYC Verification",
      },
      {
        sender: context.auth.user,
        code: "123456",
        type: "PINCODE",
      }
    );
  });

  it("throws INTERNAL_SERVER_ERROR when topic scheme registry is not configured", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        // Missing topicSchemeRegistry
      },
    });

    const input: TopicDeleteInput = {
      name: "Test Topic",
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
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Topic scheme registry not found in system configuration",
    });

    expect(context.portalClient.mutate).not.toHaveBeenCalled();
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
        topicSchemeRegistry: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
      },
    });

    // Mock portal mutation failure
    const portalError = new Error("Transaction failed");
    context.portalClient.mutate = vi.fn().mockRejectedValue(portalError);

    const input: TopicDeleteInput = {
      name: "Test Topic",
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

  it("deletes multiple topics with different names", async () => {
    const handler = getHandler();
    const context = createBaseContext({
      system: {
        systemAccessManager: {
          id: "0xAAAAAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
          accessControl: {
            roles: [],
          },
        },
        topicSchemeRegistry: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
      },
    });

    context.portalClient.mutate = vi
      .fn()
      .mockResolvedValue(
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
      );

    const walletVerification = {
      secretVerificationCode: "123456",
      verificationType: VerificationType.pincode,
    };

    const testCases = [
      { name: "KYC", walletVerification },
      { name: "AML Check", walletVerification },
      { name: "Investor Status", walletVerification },
    ];

    for (const testCase of testCases) {
      const result = await handler({
        input: testCase,
        context,
        errors,
      });

      expect(result.name).toBe(testCase.name);
      expect(result.transactionHash).toBe(
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
      );
    }

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(3);
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
        topicSchemeRegistry: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
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

    const input: TopicDeleteInput = {
      name: "Credit Score",
      walletVerification: {
        secretVerificationCode: "123456",
        verificationType: VerificationType.pincode,
      },
    };

    await handler({
      input,
      context,
      errors,
    });

    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("RemoveTopicSchemeMutation"), // GraphQL mutation document
      {
        address: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        from: "0x2222222222222222222222222222222222222222",
        name: "Credit Score",
      },
      {
        sender: {
          id: "user_2",
          wallet: "0x2222222222222222222222222222222222222222",
        },
        code: "123456",
        type: "PINCODE",
      }
    );
  });
});
