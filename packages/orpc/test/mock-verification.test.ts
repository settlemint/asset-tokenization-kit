/**
 * Test to verify Bun mocking capabilities are working
 */
import { describe, expect, it } from "bun:test";
import { createBaseContext, createMockErrors, mockCall, resetAllMocks } from "./orpc-route-helpers";

describe("Mock verification", () => {
  it("should create base context with mocked services", () => {
    const context = createBaseContext();

    expect(context.auth).toBeDefined();
    expect(context.auth.user.id).toBe("user_1");
    expect(context.portalClient).toBeDefined();
    expect(context.theGraphClient).toBeDefined();
  });

  it("should create mock errors that throw properly", () => {
    const errors = createMockErrors();

    expect(() => errors.NOT_FOUND({ message: "Test error" })).toThrow("Test error");

    try {
      errors.UNAUTHORIZED();
    } catch (error) {
      expect((error as { code?: string }).code).toBe("UNAUTHORIZED");
    }
  });

  it("should have mockCall available", () => {
    resetAllMocks();

    expect(mockCall).toBeDefined();
    expect(mockCall).toBeFunction();

    mockCall.mockResolvedValue({ test: "value" });
    expect(mockCall).toHaveBeenCalledTimes(0);
  });
});
