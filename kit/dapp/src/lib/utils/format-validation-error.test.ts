import { ORPCError } from "@orpc/server";
import { describe, expect, test } from "vitest";
import {
  formatValidationError,
  getFieldErrors,
  isValidationError,
} from "./format-validation-error";

describe("format-validation-error", () => {
  // Helper to create validation errors
  const createValidationError = (
    code: "INPUT_VALIDATION_FAILED" | "OUTPUT_VALIDATION_FAILED",
    errors: Array<{
      path: string;
      message: string;
      code?: string;
      expected?: unknown;
      received?: unknown;
    }>,
    prettyMessage?: string
  ) => {
    const data: {
      errors: typeof errors;
      errorCount: number;
      message?: string;
    } = {
      errors,
      errorCount: errors.length,
    };

    if (prettyMessage) {
      data.message = prettyMessage;
    }

    return new ORPCError(code, {
      message: "Validation failed",
      data,
    });
  };

  describe("isValidationError", () => {
    test("should return true for INPUT_VALIDATION_FAILED errors", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "email", message: "Invalid email" },
      ]);
      expect(isValidationError(error)).toBe(true);
    });

    test("should return true for OUTPUT_VALIDATION_FAILED errors", () => {
      const error = createValidationError("OUTPUT_VALIDATION_FAILED", [
        { path: "response.data", message: "Invalid response data" },
      ]);
      expect(isValidationError(error)).toBe(true);
    });

    test("should return false for other ORPC errors", () => {
      const error = new ORPCError("BAD_REQUEST", {
        message: "Bad request",
      });
      expect(isValidationError(error)).toBe(false);
    });

    test("should return false for non-Error objects", () => {
      expect(isValidationError("string error")).toBe(false);
      expect(isValidationError(123)).toBe(false);
      expect(isValidationError(null)).toBe(false);
      expect(isValidationError(undefined)).toBe(false);
      expect(isValidationError({})).toBe(false);
    });

    test("should return false for regular Error objects", () => {
      expect(isValidationError(new Error("Regular error"))).toBe(false);
      expect(isValidationError(new TypeError("Type error"))).toBe(false);
    });

    test("should return false for ORPCError without data", () => {
      const error = new ORPCError("INPUT_VALIDATION_FAILED", {
        message: "No data",
      });
      expect(isValidationError(error)).toBe(false);
    });

    test("should return false for ORPCError with invalid data structure", () => {
      const error1 = new ORPCError("INPUT_VALIDATION_FAILED", {
        message: "Invalid data",
        data: "string data",
      });
      expect(isValidationError(error1)).toBe(false);

      const error2 = new ORPCError("INPUT_VALIDATION_FAILED", {
        message: "Invalid data",
        data: { notErrors: [] },
      });
      expect(isValidationError(error2)).toBe(false);

      const error3 = new ORPCError("INPUT_VALIDATION_FAILED", {
        message: "Invalid data",
        data: { errors: "not an array" },
      });
      expect(isValidationError(error3)).toBe(false);
    });

    test("should validate complete structure", () => {
      const validError = createValidationError(
        "INPUT_VALIDATION_FAILED",
        [
          {
            path: "user.email",
            message: "Email is required",
            code: "required",
          },
        ],
        "Pretty message"
      );
      expect(isValidationError(validError)).toBe(true);
    });
  });

  describe("formatValidationError", () => {
    test("should use pretty-printed message when available", () => {
      const error = createValidationError(
        "INPUT_VALIDATION_FAILED",
        [{ path: "email", message: "Invalid email" }],
        "Email must be a valid email address"
      );
      expect(formatValidationError(error)).toBe(
        "Email must be a valid email address"
      );
    });

    test("should format single error without pretty message", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "username", message: "Username is required" },
      ]);
      expect(formatValidationError(error)).toBe(
        "username: Username is required"
      );
    });

    test("should format single error without path", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "", message: "General validation error" },
      ]);
      expect(formatValidationError(error)).toBe("General validation error");
    });

    test("should format multiple errors as list", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "email", message: "Email is required" },
        { path: "password", message: "Password too short" },
        { path: "age", message: "Must be 18 or older" },
      ]);
      expect(formatValidationError(error)).toBe(
        "Validation failed with 3 errors:\n• email: Email is required\n• password: Password too short\n• age: Must be 18 or older"
      );
    });

    test("should format multiple errors with some missing paths", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "email", message: "Email is required" },
        { path: "", message: "General error" },
        { path: "age", message: "Invalid age" },
      ]);
      expect(formatValidationError(error)).toBe(
        "Validation failed with 3 errors:\n• email: Email is required\n• General error\n• age: Invalid age"
      );
    });

    test("should handle empty errors array", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", []);
      expect(formatValidationError(error)).toBe(
        "Validation failed with 0 errors:\n"
      );
    });

    test("should format regular Error objects", () => {
      const error = new Error("Something went wrong");
      expect(formatValidationError(error)).toBe("Something went wrong");
    });

    test("should format non-Error objects", () => {
      expect(formatValidationError("string error")).toBe(
        "An unknown error occurred"
      );
      expect(formatValidationError(123)).toBe("An unknown error occurred");
      expect(formatValidationError(null)).toBe("An unknown error occurred");
      expect(formatValidationError(undefined)).toBe(
        "An unknown error occurred"
      );
      expect(formatValidationError({})).toBe("An unknown error occurred");
    });

    test("should handle errors with complex data", () => {
      const error = createValidationError("OUTPUT_VALIDATION_FAILED", [
        {
          path: "response.data.items[0].price",
          message: "Expected number, received string",
          code: "invalid_type",
          expected: "number",
          received: "string",
        },
        {
          path: "response.data.items[1].quantity",
          message: "Number must be positive",
          code: "custom",
        },
      ]);
      expect(formatValidationError(error)).toBe(
        "Validation failed with 2 errors:\n• response.data.items[0].price: Expected number, received string\n• response.data.items[1].quantity: Number must be positive"
      );
    });

    test("should handle single error edge case where first error is undefined", () => {
      // This tests the edge case in the code where errors[0] might be undefined
      const error = new ORPCError("INPUT_VALIDATION_FAILED", {
        message: "Validation failed",
        data: {
          errors: [undefined] as unknown as Array<{
            path: string;
            message: string;
            code?: string;
            expected?: unknown;
            received?: unknown;
          }>, // Simulate undefined first error
          errorCount: 1,
        },
      });
      expect(formatValidationError(error)).toBe("Validation failed");
    });
  });

  describe("getFieldErrors", () => {
    test("should return field errors map", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "email", message: "Email is required" },
        { path: "password", message: "Password too short" },
        { path: "confirmPassword", message: "Passwords do not match" },
      ]);
      const fieldErrors = getFieldErrors(error);
      expect(fieldErrors).toEqual({
        email: "Email is required",
        password: "Password too short",
        confirmPassword: "Passwords do not match",
      });
    });

    test("should ignore errors without paths", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "email", message: "Email is required" },
        { path: "", message: "General error" },
        { path: "age", message: "Invalid age" },
      ]);
      const fieldErrors = getFieldErrors(error);
      expect(fieldErrors).toEqual({
        email: "Email is required",
        age: "Invalid age",
      });
    });

    test("should handle nested paths", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "user.profile.name", message: "Name is required" },
        { path: "user.settings.theme", message: "Invalid theme" },
        { path: "items[0].quantity", message: "Quantity must be positive" },
      ]);
      const fieldErrors = getFieldErrors(error);
      expect(fieldErrors).toEqual({
        "user.profile.name": "Name is required",
        "user.settings.theme": "Invalid theme",
        "items[0].quantity": "Quantity must be positive",
      });
    });

    test("should return empty object for non-validation errors", () => {
      expect(getFieldErrors(new Error("Regular error"))).toEqual({});
      expect(getFieldErrors("string error")).toEqual({});
      expect(getFieldErrors(null)).toEqual({});
      expect(getFieldErrors(undefined)).toEqual({});
    });

    test("should return empty object for validation error with no field errors", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "", message: "General error 1" },
        { path: "", message: "General error 2" },
      ]);
      expect(getFieldErrors(error)).toEqual({});
    });

    test("should handle duplicate paths (last one wins)", () => {
      const error = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "email", message: "Email is required" },
        { path: "email", message: "Email is invalid" },
      ]);
      const fieldErrors = getFieldErrors(error);
      expect(fieldErrors).toEqual({
        email: "Email is invalid",
      });
    });

    test("should work with OUTPUT_VALIDATION_FAILED errors", () => {
      const error = createValidationError("OUTPUT_VALIDATION_FAILED", [
        { path: "response.status", message: "Invalid status code" },
        { path: "response.data", message: "Missing data" },
      ]);
      const fieldErrors = getFieldErrors(error);
      expect(fieldErrors).toEqual({
        "response.status": "Invalid status code",
        "response.data": "Missing data",
      });
    });
  });

  describe("integration scenarios", () => {
    test("should handle Zod-style validation errors", () => {
      const zodStyleError = createValidationError(
        "INPUT_VALIDATION_FAILED",
        [
          {
            path: "user.email",
            message: "Invalid email",
            code: "invalid_string",
            expected: "email",
            received: "notanemail",
          },
          {
            path: "user.age",
            message: "Number must be greater than or equal to 18",
            code: "too_small",
            expected: 18,
            received: 16,
          },
        ],
        `User validation failed:
  • Email must be a valid email address
  • Age must be at least 18`
      );

      expect(formatValidationError(zodStyleError)).toBe(
        `User validation failed:
  • Email must be a valid email address
  • Age must be at least 18`
      );

      const fieldErrors = getFieldErrors(zodStyleError);
      expect(fieldErrors).toEqual({
        "user.email": "Invalid email",
        "user.age": "Number must be greater than or equal to 18",
      });
    });

    test("should handle form validation workflow", () => {
      const formError = createValidationError("INPUT_VALIDATION_FAILED", [
        { path: "firstName", message: "First name is required" },
        { path: "lastName", message: "Last name is required" },
        { path: "email", message: "Email is invalid" },
        { path: "password", message: "Password must be at least 8 characters" },
      ]);

      // Check if it's a validation error
      expect(isValidationError(formError)).toBe(true);

      // Get field-specific errors for form display
      const fieldErrors = getFieldErrors(formError);
      expect(Object.keys(fieldErrors)).toHaveLength(4);
      expect(fieldErrors.firstName).toBe("First name is required");

      // Get formatted message for general display
      const message = formatValidationError(formError);
      expect(message).toContain("Validation failed with 4 errors");
      expect(message).toContain("firstName: First name is required");
    });

    test("should handle API response validation", () => {
      const apiError = createValidationError(
        "OUTPUT_VALIDATION_FAILED",
        [
          {
            path: "data.users[0].id",
            message: "Expected string, received number",
            code: "invalid_type",
          },
          {
            path: "data.users[1].email",
            message: "Invalid email format",
            code: "invalid_string",
          },
          {
            path: "data.pagination.total",
            message: "Expected number, received null",
            code: "invalid_type",
          },
        ],
        "API response did not match expected schema"
      );

      expect(isValidationError(apiError)).toBe(true);
      expect(formatValidationError(apiError)).toBe(
        "API response did not match expected schema"
      );
    });
  });
});
