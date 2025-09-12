import type { SessionUser } from "@/lib/auth";
import { portalClient } from "@/lib/settlemint/portal";
import { getVerificationId } from "@/orpc/helpers/get-verification-id";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { handleWalletVerificationChallenge } from "@settlemint/sdk-portal";
import { isHex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClaim, type CreateClaimInput } from "./create-claim";

// Mocks
vi.mock("@/orpc/helpers/get-verification-id", () => ({
  getVerificationId: vi.fn(),
}));
vi.mock("@/lib/settlemint/portal", () => ({
  portalClient: {
    request: vi.fn(),
  },
  portalGraphql: vi.fn((x) => x),
}));
vi.mock("@settlemint/sdk-portal", () => ({
  handleWalletVerificationChallenge: vi.fn(),
}));

describe("createClaim", () => {
  const getVerificationMock = getVerificationId as ReturnType<typeof vi.fn>;
  const handleWalletVerificationChallengeMock =
    handleWalletVerificationChallenge as ReturnType<typeof vi.fn>;
  const portalClientRequestMock = portalClient.request as ReturnType<
    typeof vi.fn
  >;

  const user = {
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    id: "user-1",
    email: "test@example.com",
  } as unknown as SessionUser;

  const walletVerification: UserVerification = {
    verificationType: "PINCODE",
    secretVerificationCode: "123456",
  };

  const identity = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a claim with a valid signature for a generic claim", async () => {
    getVerificationMock.mockReturnValue("verification-id-1");
    handleWalletVerificationChallengeMock.mockResolvedValue({
      challengeId: "challenge-1",
      challengeResponse: "response-1",
    });
    portalClientRequestMock.mockResolvedValue({
      walletSignMessage: { signature: "0xdeadbeef" },
    });

    const claim: CreateClaimInput["claim"] = {
      topicName: "knowYourCustomer",
      signature: "string claim",
      data: { claim: "KYC-APPROVED" },
    };

    const result = await createClaim({
      user,
      walletVerification,
      identity,
      claim,
    });

    expect(result).toHaveProperty("claimData");
    expect(isHex(result.signature)).toBe(true);
    expect(typeof result.topicId).toBe("bigint");
    expect(result.signature).toBe("0xdeadbeef");
    expect(portalClientRequestMock?.mock.calls[0]?.[1]).toMatchObject({
      address: user.wallet,
      challengeId: "challenge-1",
      challengeResponse: "response-1",
    });
  });

  it("throws if verification ID is not found", async () => {
    getVerificationMock.mockReturnValue(undefined);

    const claim: CreateClaimInput["claim"] = {
      topicName: "knowYourCustomer",
      signature: "string claim",
      data: { claim: "KYC-APPROVED" },
    };

    await expect(
      createClaim({
        user,
        walletVerification,
        identity,
        claim,
      })
    ).rejects.toThrow("Verification ID not found");
  });

  it("throws if signature is not a valid hex string", async () => {
    getVerificationMock.mockReturnValue("verification-id-1");
    handleWalletVerificationChallengeMock.mockResolvedValue({
      challengeId: "challenge-1",
      challengeResponse: "response-1",
    });
    portalClientRequestMock.mockResolvedValue({
      walletSignMessage: { signature: "not-a-hex" },
    });

    const claim: CreateClaimInput["claim"] = {
      topicName: "knowYourCustomer",
      signature: "string claim",
      data: { claim: "KYC-APPROVED" },
    };

    await expect(
      createClaim({
        user,
        walletVerification,
        identity,
        claim,
      })
    ).rejects.toThrow("Signature is not a valid hex string");
  });

  it("encodes asset classification claim correctly", async () => {
    getVerificationMock.mockReturnValue("verification-id-1");
    handleWalletVerificationChallengeMock.mockResolvedValue({
      challengeId: "challenge-1",
      challengeResponse: "response-1",
    });
    portalClientRequestMock.mockResolvedValue({
      walletSignMessage: { signature: "0xdeadbeef" },
    });

    const claim: CreateClaimInput["claim"] = {
      topicName: "assetClassification",
      signature: "string class, string category",
      data: { class: "Bond", category: "Debt" },
    };

    const result = await createClaim({
      user,
      walletVerification,
      identity,
      claim,
    });

    expect(result).toHaveProperty("claimData");
    expect(isHex(result.signature)).toBe(true);
  });

  it("calls handleWalletVerificationChallenge with correct params", async () => {
    getVerificationMock.mockReturnValue("verification-id-1");
    handleWalletVerificationChallengeMock.mockResolvedValue({
      challengeId: "challenge-1",
      challengeResponse: "response-1",
    });
    portalClientRequestMock.mockResolvedValue({
      walletSignMessage: { signature: "0xdeadbeef" },
    });

    const claim: CreateClaimInput["claim"] = {
      topicName: "knowYourCustomer",
      signature: "string claim",
      data: { claim: "KYC-APPROVED" },
    };

    await createClaim({
      user,
      walletVerification,
      identity,
      claim,
    });

    expect(handleWalletVerificationChallenge).toHaveBeenCalledWith(
      expect.objectContaining({
        userWalletAddress: user.wallet,
        verificationId: "verification-id-1",
        verificationType: walletVerification.verificationType,
        code: walletVerification.secretVerificationCode,
      })
    );
  });
});
