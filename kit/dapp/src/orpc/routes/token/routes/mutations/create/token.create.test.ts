/**
 * @vitest-environment node
 */
import { describe, expect, test, vi } from "vitest";

/**
 * Example test file showing proper error validation for unauthorized access
 *
 * This demonstrates how to properly test API error responses with full
 * validation of status, code, and data properties instead of just the message.
 */

// Mock error class that matches API error structure
class APIError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Mock the token create handler for testing
const mockTokenCreate = vi.fn();

describe("Token Create Authorization", () => {
  test("should reject unauthorized user with detailed error object", async () => {
    // Setup: Configure mock to throw unauthorized error
    const unauthorizedError = new APIError(
      "UNAUTHORIZED",
      401,
      "Authentication missing or failed",
      {
        reason: "No valid session",
        requiredRole: "token:create",
      }
    );

    mockTokenCreate.mockRejectedValue(unauthorizedError);

    // Act & Assert: Verify full error structure, not just message
    await expect(mockTokenCreate()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
      message: "Authentication missing or failed",
      data: {
        reason: "No valid session",
        requiredRole: "token:create",
      },
    });

    // Also verify the error is instance of APIError
    await expect(mockTokenCreate()).rejects.toBeInstanceOf(APIError);
  });

  test("should validate error response structure", async () => {
    // This test ensures we're validating the complete error response
    const error = new APIError("FORBIDDEN", 403, "Insufficient permissions", {
      requiredPermissions: ["token:create", "factory:deploy"],
      userPermissions: ["token:read"],
    });

    mockTokenCreate.mockRejectedValueOnce(error);

    try {
      await mockTokenCreate();
      expect.fail("Should have thrown an error");
    } catch (error_) {
      // Validate complete error structure
      expect(error_).toBeInstanceOf(APIError);

      const apiError = error_ as APIError;
      expect(apiError.code).toBe("FORBIDDEN");
      expect(apiError.status).toBe(403);
      expect(apiError.message).toBe("Insufficient permissions");
      expect(apiError.data).toEqual({
        requiredPermissions: ["token:create", "factory:deploy"],
        userPermissions: ["token:read"],
      });
    }
  });

  test("should not reduce error validation to just message string", async () => {
    // Bad practice - only checking message
    const badTest = async () => {
      mockTokenCreate.mockRejectedValueOnce(
        new Error("Authentication missing or failed")
      );

      // ❌ This only validates the message, missing important error details
      await expect(mockTokenCreate()).rejects.toThrow(
        "Authentication missing or failed"
      );
    };

    // Good practice - validate full error object
    const goodTest = async () => {
      const error = new APIError(
        "UNAUTHORIZED",
        401,
        "Authentication missing or failed",
        { sessionExpired: true }
      );

      mockTokenCreate.mockRejectedValueOnce(error);

      // ✅ This validates the complete error response
      await expect(mockTokenCreate()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        status: 401,
        message: expect.stringContaining("Authentication"),
        data: expect.objectContaining({
          sessionExpired: true,
        }),
      });
    };

    // Run both to show the difference
    await badTest();
    await goodTest();
  });

  test("migration example: from simple to comprehensive error testing", () => {
    // Before migration (reduced validation):
    const beforeMigration = () => {
      // Only checks error message - loses important context
      expect(() => {
        throw new Error("Authentication missing or failed");
      }).toThrow("Authentication missing or failed");
    };

    // After migration (comprehensive validation):
    const afterMigration = () => {
      // Validates full error structure
      expect(() => {
        throw new APIError(
          "UNAUTHORIZED",
          401,
          "Authentication missing or failed",
          {
            timestamp: new Date().toISOString(),
            requestId: "req_123",
            path: "/api/token/create",
          }
        );
      }).toThrow(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          status: 401,
          message: "Authentication missing or failed",
          data: expect.objectContaining({
            path: "/api/token/create",
          }),
        })
      );
    };

    // Both should pass their respective tests
    beforeMigration();
    afterMigration();
  });
});
