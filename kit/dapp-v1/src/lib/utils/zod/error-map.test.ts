import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { customErrorKey, zodErrorMap } from "./error-map";

describe("zodErrorMap", () => {
  describe("invalid_type", () => {
    it("should return validation.required for undefined", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_type,
        expected: "string",
        received: "undefined",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.required");
    });

    it("should return validation.invalidType for other types", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_type,
        expected: "string",
        received: "number",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidType.string");
    });
  });

  describe("invalid_literal", () => {
    it("should return validation.invalidLiteral", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_literal,
        expected: "test",
        received: "other",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidLiteral");
    });
  });

  describe("unrecognized_keys", () => {
    it("should return validation.unrecognizedKeys", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.unrecognized_keys,
        keys: ["extra"],
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.unrecognizedKeys");
    });
  });

  describe("invalid_union", () => {
    it("should return validation.invalidUnion", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_union,
        unionErrors: [],
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidUnion");
    });
  });

  describe("invalid_union_discriminator", () => {
    it("should return validation.invalidUnionDiscriminator", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_union_discriminator,
        options: ["a", "b"],
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidUnionDiscriminator");
    });
  });

  describe("invalid_enum_value", () => {
    it("should return validation.invalidEnumValue", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_enum_value,
        options: ["A", "B"],
        received: "C",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidEnumValue");
    });
  });

  describe("invalid_arguments", () => {
    it("should return validation.invalidArguments", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_arguments,
        argumentsError: new z.ZodError([]),
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidArguments");
    });
  });

  describe("invalid_return_type", () => {
    it("should return validation.invalidReturnType", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_return_type,
        returnTypeError: new z.ZodError([]),
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidReturnType");
    });
  });

  describe("invalid_date", () => {
    it("should return validation.invalidDate", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_date,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidDate");
    });
  });

  describe("invalid_string", () => {
    it("should return validation.invalidEmail for email validation", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_string,
        validation: "email",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidEmail");
    });

    it("should return validation.invalidUrl for url validation", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_string,
        validation: "url",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidUrl");
    });

    it("should return validation.invalidUuid for uuid validation", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_string,
        validation: "uuid",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidUuid");
    });

    it("should return validation.invalidPattern for regex validation", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_string,
        validation: "regex",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidPattern");
    });

    it("should return validation.invalidCuid for cuid validation", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_string,
        validation: "cuid",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidCuid");
    });

    it("should return validation.invalidDatetime for datetime validation", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_string,
        validation: "datetime",
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidDatetime");
    });

    it("should return generic validation.invalidString for other validations", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_string,
        validation: { includes: "test" },
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidString.[object Object]");
    });
  });

  describe("too_small", () => {
    describe("array", () => {
      it("should return exactLength for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "array",
          minimum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.array.exactLength");
      });

      it("should return minLength for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "array",
          minimum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.array.minLength");
      });

      it("should return minLengthExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "array",
          minimum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.array.minLengthExclusive");
      });
    });

    describe("string", () => {
      it("should return exactLength for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "string",
          minimum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.string.exactLength");
      });

      it("should return minLength for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "string",
          minimum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.string.minLength");
      });

      it("should return minLengthExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "string",
          minimum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.string.minLengthExclusive");
      });
    });

    describe("number", () => {
      it("should return exact for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "number",
          minimum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.number.exact");
      });

      it("should return min for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "number",
          minimum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.number.min");
      });

      it("should return minExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "number",
          minimum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.number.minExclusive");
      });
    });

    describe("date", () => {
      it("should return exact for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "date",
          minimum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.date.exact");
      });

      it("should return min for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "date",
          minimum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.date.min");
      });

      it("should return minExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_small,
          type: "date",
          minimum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.date.minExclusive");
      });
    });

    it("should return validation.tooSmall for other types", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.too_small,
        type: "bigint",
        minimum: 5n,
        inclusive: true,
        exact: false,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.tooSmall");
    });
  });

  describe("too_big", () => {
    describe("array", () => {
      it("should return exactLength for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "array",
          maximum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.array.exactLength");
      });

      it("should return maxLength for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "array",
          maximum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.array.maxLength");
      });

      it("should return maxLengthExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "array",
          maximum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.array.maxLengthExclusive");
      });
    });

    describe("string", () => {
      it("should return exactLength for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "string",
          maximum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.string.exactLength");
      });

      it("should return maxLength for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "string",
          maximum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.string.maxLength");
      });

      it("should return maxLengthExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "string",
          maximum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.string.maxLengthExclusive");
      });
    });

    describe("number", () => {
      it("should return exact for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "number",
          maximum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.number.exact");
      });

      it("should return max for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "number",
          maximum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.number.max");
      });

      it("should return maxExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "number",
          maximum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.number.maxExclusive");
      });
    });

    describe("date", () => {
      it("should return exact for exact", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "date",
          maximum: 5,
          inclusive: true,
          exact: true,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.date.exact");
      });

      it("should return max for inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "date",
          maximum: 5,
          inclusive: true,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.date.max");
      });

      it("should return maxExclusive for non-inclusive", () => {
        const issue: z.ZodIssue = {
          code: z.ZodIssueCode.too_big,
          type: "date",
          maximum: 5,
          inclusive: false,
          exact: false,
          path: ["field"],
          message: "",
        };
        const result = zodErrorMap(issue, {
          defaultError: "default",
          data: undefined,
        });
        expect(result.message).toBe("validation.date.maxExclusive");
      });
    });

    it("should return validation.tooBig for other types", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.too_big,
        type: "bigint",
        maximum: 5n,
        inclusive: true,
        exact: false,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.tooBig");
    });
  });

  describe("custom", () => {
    it("should return the custom message if provided", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.custom,
        path: ["field"],
        message: "validation.custom.myValidator.myError",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.custom.myValidator.myError");
    });

    it("should return validation.custom.default if no message", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.custom,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.custom.default");
    });
  });

  describe("invalid_intersection_types", () => {
    it("should return validation.invalidIntersection", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.invalid_intersection_types,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.invalidIntersection");
    });
  });

  describe("not_multiple_of", () => {
    it("should return validation.notMultipleOf", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.not_multiple_of,
        multipleOf: 5,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.notMultipleOf");
    });
  });

  describe("not_finite", () => {
    it("should return validation.notFinite", () => {
      const issue: z.ZodIssue = {
        code: z.ZodIssueCode.not_finite,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.notFinite");
    });
  });

  describe("default case", () => {
    it("should return validation.default for unknown codes", () => {
      const issue: z.ZodIssue = {
        code: "unknown_code" as any,
        path: ["field"],
        message: "",
      };
      const result = zodErrorMap(issue, {
        defaultError: "default",
        data: undefined,
      });
      expect(result.message).toBe("validation.default");
    });
  });
});

describe("customErrorKey", () => {
  it("should create properly formatted custom error keys", () => {
    expect(customErrorKey("ethereumAddress", "invalidFormat")).toBe(
      "validation.custom.ethereumAddress.invalidFormat"
    );
    expect(customErrorKey("isin", "invalidChecksum")).toBe(
      "validation.custom.isin.invalidChecksum"
    );
    expect(customErrorKey("amount", "tooSmall")).toBe(
      "validation.custom.amount.tooSmall"
    );
  });
});

describe("integration with z.setErrorMap", () => {
  it("should work when set globally", () => {
    const originalErrorMap = z.getErrorMap();

    try {
      z.setErrorMap(zodErrorMap);

      const schema = z.string().min(5);
      const result = schema.safeParse("abc");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "validation.string.minLength"
        );
      }
    } finally {
      // Restore original error map
      z.setErrorMap(originalErrorMap);
    }
  });

  it("should work when passed to safeParse", () => {
    const schema = z.string().email();
    const result = schema.safeParse("invalid-email", { errorMap: zodErrorMap });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("validation.invalidEmail");
    }
  });
});
