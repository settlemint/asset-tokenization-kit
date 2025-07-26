/**
 * Test Suite for Challenge-Response Authentication Helper
 *
 * This test suite verifies the functionality of the challenge-response authentication
 * mechanism, which handles various verification methods (pincode, secret code, and
 * two-factor authentication) for wallet ownership verification.
 *
 * The tests cover:
 * - Successful verification flows for all authentication types
 * - Error handling for missing verification IDs
 * - Error handling for portal API failures
 * - Proper error type creation and properties
 * - Correct mapping of verification types to portal API expectations
 * @see {@link ./challenge-response} - Implementation being tested
 */

import type { SessionUser } from "@/lib/auth";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { VerificationCode } from "@/lib/zod/validators/verification-code";
import { verificationType } from "@/lib/zod/validators/verification-type";
import { ORPCError } from "@orpc/server";
import { handleWalletVerificationChallenge } from "@settlemint/sdk-portal";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleChallenge } from "./challenge-response";

// Mock the external dependencies
vi.mock("@settlemint/sdk-portal", () => ({
  handleWalletVerificationChallenge: vi.fn(() =>
    Promise.resolve({
      challengeResponse: "mocked-response",
      verificationId: "mocked-verification-id",
    })
  ),
}));

vi.mock("@/lib/settlemint/portal", () => ({
  portalClient: {},
  portalGraphql: {},
}));

describe("challenge-response", () => {
  const mockWalletAddress =
    "0x1234567890123456789012345678901234567890" as EthereumAddress;
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    banned: false,
    role: "investor" as const,
    pincodeVerificationId: "pincode-verification-id",
    secretCodeVerificationId: "secret-code-verification-id",
    twoFactorVerificationId: "two-factor-verification-id",
    wallet: mockWalletAddress,
  } as SessionUser;

  const mockCode = "123456" as VerificationCode;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleChallenge", () => {
    it("should handle pincode verification successfully", async () => {
      const mockResponse = {
        challengeResponse: "success-response",
        verificationId: "verification-id",
      };
      const mockedFunction = vi.mocked(handleWalletVerificationChallenge);
      mockedFunction.mockResolvedValueOnce(mockResponse);

      const verType = verificationType.parse("pincode");
      const result = await handleChallenge(mockUser, {
        code: mockCode,
        type: verType,
      });

      expect(result).toEqual(mockResponse);
      expect(mockedFunction).toHaveBeenCalledWith({
        verificationId: "pincode-verification-id",
        userWalletAddress: mockWalletAddress,
        code: mockCode,
        verificationType: "pincode",
        portalClient: expect.any(Object),
        portalGraphql: expect.any(Object),
      });
    });

    it("should handle secret-code verification successfully", async () => {
      const mockResponse = {
        challengeResponse: "success-response",
        verificationId: "verification-id",
      };
      const mockedFunction = vi.mocked(handleWalletVerificationChallenge);
      mockedFunction.mockResolvedValueOnce(mockResponse);

      const verType = verificationType.parse("secret-code");
      const result = await handleChallenge(mockUser, {
        code: mockCode,
        type: verType,
      });

      expect(result).toEqual(mockResponse);
      expect(mockedFunction).toHaveBeenCalledWith({
        verificationId: "secret-code-verification-id",
        userWalletAddress: mockWalletAddress,
        code: mockCode,
        verificationType: "secret-code",
        portalClient: expect.any(Object),
        portalGraphql: expect.any(Object),
      });
    });

    it("should handle two-factor verification successfully", async () => {
      const mockResponse = {
        challengeResponse: "success-response",
        verificationId: "verification-id",
      };
      const mockedFunction = vi.mocked(handleWalletVerificationChallenge);
      mockedFunction.mockResolvedValueOnce(mockResponse);

      const verType = verificationType.parse("two-factor");
      const result = await handleChallenge(mockUser, {
        code: mockCode,
        type: verType,
      });

      expect(result).toEqual(mockResponse);
      expect(mockedFunction).toHaveBeenCalledWith({
        verificationId: "two-factor-verification-id",
        userWalletAddress: mockWalletAddress,
        code: mockCode,
        verificationType: "otp", // Note: two-factor maps to otp
        portalClient: expect.any(Object),
        portalGraphql: expect.any(Object),
      });
    });

    it("should throw ORPCError when verification ID is not found", async () => {
      const userWithoutPincode = {
        ...mockUser,
        pincodeVerificationId: undefined,
      };

      const verType = verificationType.parse("pincode");

      await expect(
        handleChallenge(userWithoutPincode, { code: mockCode, type: verType })
      ).rejects.toThrow(ORPCError);

      try {
        await handleChallenge(userWithoutPincode, {
          code: mockCode,
          type: verType,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.code).toBe("VERIFICATION_ID_NOT_FOUND");
          expect(error.message).toBe(
            "Verification ID not found for pincode authentication"
          );
          expect(
            (error.data as { verificationType: string }).verificationType
          ).toBe(verType);
        }
      }
    });

    it("should throw ORPCError when portal challenge handler fails", async () => {
      const portalError = new Error("Portal API error");
      const mockedFunction = vi.mocked(handleWalletVerificationChallenge);
      mockedFunction.mockRejectedValueOnce(portalError);

      const verType = verificationType.parse("pincode");

      await expect(
        handleChallenge(mockUser, { code: mockCode, type: verType })
      ).rejects.toThrow(ORPCError);

      try {
        await handleChallenge(mockUser, { code: mockCode, type: verType });
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.code).toBe("CHALLENGE_FAILED");
          expect(error.message).toBe(
            "Challenge verification failed: Portal API error"
          );
          expect(
            (error.data as { verificationType: string }).verificationType
          ).toBe(verType);
        }
      }
    });

    it("should handle unknown errors gracefully", async () => {
      const mockedFunction = vi.mocked(handleWalletVerificationChallenge);
      mockedFunction.mockRejectedValueOnce("Unknown error type");

      const verType = verificationType.parse("pincode");

      await expect(
        handleChallenge(mockUser, { code: mockCode, type: verType })
      ).rejects.toThrow(ORPCError);

      try {
        await handleChallenge(mockUser, { code: mockCode, type: verType });
      } catch (error) {
        expect(error).toBeInstanceOf(ORPCError);
        if (error instanceof ORPCError) {
          expect(error.code).toBe("CHALLENGE_FAILED");
          expect(error.message).toBe(
            "Challenge verification failed: Unknown error"
          );
          expect(
            (error.data as { verificationType: string }).verificationType
          ).toBe(verType);
        }
      }
    });
  });

  describe("ORPCError behavior", () => {
    it("should create VERIFICATION_ID_NOT_FOUND error with correct properties", () => {
      const verType = verificationType.parse("pincode");
      const error = new ORPCError("VERIFICATION_ID_NOT_FOUND", {
        message: "Test error message",
        data: { verificationType: verType },
      });

      expect(error.code).toBe("VERIFICATION_ID_NOT_FOUND");
      expect(error.message).toBe("Test error message");
      expect(error.data.verificationType).toBe(verType);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ORPCError);
    });

    it("should create CHALLENGE_FAILED error with correct properties", () => {
      const verType = verificationType.parse("two-factor");
      const error = new ORPCError("CHALLENGE_FAILED", {
        message: "Challenge failed message",
        data: { verificationType: verType },
      });

      expect(error.code).toBe("CHALLENGE_FAILED");
      expect(error.message).toBe("Challenge failed message");
      expect(error.data.verificationType).toBe(verType);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ORPCError);
    });
  });
});
