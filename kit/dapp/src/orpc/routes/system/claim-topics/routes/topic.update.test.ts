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
import "./topic.update";
import type {
  TopicUpdateInput,
  TopicUpdateOutput,
} from "./topic.update.schema";

vi.mock("@/lib/settlemint/portal");
vi.mock("@/orpc/helpers/challenge-response", () => ({
  handleChallenge: vi.fn(() =>
    Promise.resolve({ challengeId: "verif_1", challengeResponse: "signed" })
  ),
}));

installSystemRouterCaptureMock();

function getHandler(): OrpcHandler<TopicUpdateInput, TopicUpdateOutput> {
  const handler = getCapturedHandler();
  if (!handler) throw new Error("Handler not captured");
  return handler as OrpcHandler<TopicUpdateInput, TopicUpdateOutput>;
}

describe("system.claim-topics.topic.update unit", () => {
  let errors: ReturnType<typeof createMockErrors>;

  beforeEach(() => {
    vi.clearAllMocks();
    errors = createMockErrors();
  });

  it("updates topic signature with valid input and permissions", async () => {
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

    const input: TopicUpdateInput = {
      name: "KYC Verification",
      signature: "isKYCVerified(address,bytes32,uint256)",
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
      newSignature: "isKYCVerified(address,bytes32,uint256)",
    });

    expect(context.portalClient.mutate).toHaveBeenCalledTimes(1);
    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("UpdateTopicSchemeMutation"), // The GraphQL mutation
      {
        address: "0xBBBBbBBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
        from: context.auth.user.wallet,
        name: "KYC Verification",
        newSignature: "isKYCVerified(address,bytes32,uint256)",
      }
    );
  });

  it("updates topic with different valid signature format", async () => {
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

    const input: TopicUpdateInput = {
      name: "Age Verification",
      signature: "checkAge(address)",
    };

    const result = await handler({
      input,
      context,
      errors,
    });

    expect(result).toEqual({
      transactionHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      name: "Age Verification",
      newSignature: "checkAge(address)",
    });
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

    const input: TopicUpdateInput = {
      name: "Test Topic",
      signature: "testFunction(address)",
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

    const input: TopicUpdateInput = {
      name: "Test Topic",
      signature: "testFunction(address)",
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

  it("updates multiple topics with different signatures", async () => {
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
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );

    const testCases = [
      { name: "KYC", signature: "isKYC(address,uint256)" },
      { name: "AML Check", signature: "isAMLCompliant(address,bytes32)" },
      {
        name: "Investor Status",
        signature: "isAccreditedInvestor(address,bool)",
      },
    ];

    for (const testCase of testCases) {
      const result = await handler({
        input: testCase,
        context,
        errors,
      });

      expect(result.name).toBe(testCase.name);
      expect(result.newSignature).toBe(testCase.signature);
      expect(result.transactionHash).toBe(
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

    const input: TopicUpdateInput = {
      name: "Credit Score",
      signature: "getCreditScore(address,uint256,bool)",
    };

    await handler({
      input,
      context,
      errors,
    });

    expect(context.portalClient.mutate).toHaveBeenCalledWith(
      expect.stringContaining("UpdateTopicSchemeMutation"), // GraphQL mutation document
      {
        address: "0xCCCCcCCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc",
        from: "0x2222222222222222222222222222222222222222",
        name: "Credit Score",
        newSignature: "getCreditScore(address,uint256,bool)",
      }
    );
  });
});
