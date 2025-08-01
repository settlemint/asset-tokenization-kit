import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { safeParse } from "./index";

// Mock the redactSensitiveFields function (hoisted)
vi.mock("../redaction", () => ({
  redactSensitiveFields: (value: unknown) => value,
}));

process.env.CI = "true";

describe("safeParse", () => {
  describe("successful validation", () => {
    it("should return parsed data for valid input", () => {
      const schema = z.string();
      const result = safeParse(schema, "hello");
      expect(result).toBe("hello");
    });

    it("should work with complex schemas", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0),
        email: z.email(),
      });

      const validData = {
        name: "John Doe",
        age: 30,
        email: "john@example.com",
      };

      const result = safeParse(schema, validData);
      expect(result).toEqual(validData);
    });

    it("should transform data according to schema", () => {
      const schema = z.string().transform((val) => val.toUpperCase());
      const result = safeParse(schema, "hello");
      expect(result).toBe("HELLO");
    });

    it("should work with optional fields", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const result = safeParse(schema, { required: "test" });
      expect(result).toEqual({ required: "test" });
    });

    it("should work with nullable fields", () => {
      const schema = z.object({
        name: z.string().nullable(),
      });

      const result = safeParse(schema, { name: null });
      expect(result).toEqual({ name: null });
    });

    it("should work with union types", () => {
      const schema = z.union([z.string(), z.number()]);

      expect(safeParse(schema, "test")).toBe("test");
      expect(safeParse(schema, 123)).toBe(123);
    });

    it("should work with array schemas", () => {
      const schema = z.array(z.number());
      const result = safeParse(schema, [1, 2, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should work with nested objects", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            age: z.number(),
          }),
        }),
      });

      const data = {
        user: {
          profile: {
            name: "John",
            age: 25,
          },
        },
      };

      const result = safeParse(schema, data);
      expect(result).toEqual(data);
    });

    it("should handle refinements", () => {
      const schema = z.string().refine((val) => val.length > 5, {
        message: "String must be longer than 5 characters",
      });

      const result = safeParse(schema, "hello world");
      expect(result).toBe("hello world");
    });

    it("should handle preprocessing", () => {
      const schema = z.preprocess(
        (val) => String(val).trim(),
        z.string().min(1)
      );

      const result = safeParse(schema, "  hello  ");
      expect(result).toBe("hello");
    });
  });

  describe("failed validation", () => {
    it("should throw error for invalid input", () => {
      const schema = z.string();
      expect(() => safeParse(schema, 123)).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for missing required fields", () => {
      const schema = z.object({
        required: z.string(),
      });

      expect(() => safeParse(schema, {})).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for invalid email", () => {
      const schema = z.email();
      expect(() => safeParse(schema, "not-an-email")).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for number out of range", () => {
      const schema = z.number().min(10).max(20);
      expect(() => safeParse(schema, 5)).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
      expect(() => safeParse(schema, 25)).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for invalid array items", () => {
      const schema = z.array(z.number());
      expect(() => safeParse(schema, [1, "2", 3])).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for failed refinements", () => {
      const schema = z.string().refine((val) => val.includes("@"), {
        message: "Must contain @",
      });

      expect(() => safeParse(schema, "hello")).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for invalid union type", () => {
      const schema = z.union([z.string(), z.number()]);
      expect(() => safeParse(schema, true)).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for null when not nullable", () => {
      const schema = z.string();
      expect(() => safeParse(schema, null)).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for undefined when not optional", () => {
      const schema = z.string();
      expect(() => safeParse(schema, undefined)).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for invalid enum value", () => {
      const schema = z.enum(["apple", "banana", "orange"]);
      expect(() => safeParse(schema, "grape")).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for invalid date", () => {
      const schema = z.date();
      expect(() => safeParse(schema, "2023-01-01")).toThrow(
        "Validation failed with error(s). Check logs for details."
      );
    });

    it("should throw error for deeply nested validation failure", () => {
      const schema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.string(),
          }),
        }),
      });

      expect(() =>
        safeParse(schema, { level1: { level2: { level3: 123 } } })
      ).toThrow("Validation failed with error(s). Check logs for details.");
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", () => {
      const schema = z.object({});
      const result = safeParse(schema, {});
      expect(result).toEqual({});
    });

    it("should handle empty arrays", () => {
      const schema = z.array(z.string());
      const result = safeParse(schema, []);
      expect(result).toEqual([]);
    });

    it("should handle very large numbers", () => {
      const schema = z.number();
      const result = safeParse(schema, Number.MAX_SAFE_INTEGER);
      expect(result).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should handle very small numbers", () => {
      const schema = z.number();
      const result = safeParse(schema, Number.MIN_SAFE_INTEGER);
      expect(result).toBe(Number.MIN_SAFE_INTEGER);
    });

    it("should handle boolean schemas", () => {
      const schema = z.boolean();
      expect(safeParse(schema, true)).toBe(true);
      expect(safeParse(schema, false)).toBe(false);
    });

    it("should handle literal schemas", () => {
      const schema = z.literal("exact-value");
      expect(safeParse(schema, "exact-value")).toBe("exact-value");
      expect(() => safeParse(schema, "other-value")).toThrow();
    });

    it("should handle record schemas", () => {
      const schema = z.record(z.string(), z.number());
      const data = { a: 1, b: 2, c: 3 };
      const result = safeParse(schema, data);
      expect(result).toEqual(data);
    });

    it("should handle tuple schemas", () => {
      const schema = z.tuple([z.string(), z.number(), z.boolean()]);
      const data: [string, number, boolean] = ["test", 123, true];
      const result = safeParse(schema, data);
      expect(result).toEqual(data);
    });

    it("should handle promise schemas", () => {
      // Zod's promise schemas can cause issues with synchronous parsing
      // depending on the version and configuration
      const schema = z.promise(z.string());
      const promise = Promise.resolve("test");

      // In some Zod versions, using promise schemas with safeParse throws
      // because they require async parsing methods
      expect(() => safeParse(schema, promise)).toThrow(
        "Encountered Promise during synchronous parse"
      );
    });

    it("should handle instanceof schemas", () => {
      const schema = z.instanceof(Date);
      const date = new Date();
      const result = safeParse(schema, date);
      expect(result).toBe(date);
    });

    it("should handle any schema", () => {
      const schema = z.any();
      expect(safeParse(schema, "string")).toBe("string");
      expect(safeParse(schema, 123)).toBe(123);
      expect(safeParse(schema, null)).toBe(null);
      expect(safeParse(schema, undefined)).toBe(undefined);
    });

    it("should handle unknown schema", () => {
      const schema = z.unknown();
      const symbol = Symbol("test");
      expect(safeParse(schema, symbol)).toBe(symbol);
    });

    it("should handle never schema", () => {
      const schema = z.never();
      expect(() => safeParse(schema, "anything")).toThrow();
    });

    it("should handle void schema", () => {
      const schema = z.void();
      // For void schemas, safeParse should complete without throwing
      expect(() => {
        safeParse(schema, undefined);
      }).not.toThrow();
    });

    it("should handle intersection types", () => {
      const schema = z.intersection(
        z.object({ a: z.string() }),
        z.object({ b: z.number() })
      );
      const result = safeParse(schema, { a: "test", b: 123 });
      expect(result).toEqual({ a: "test", b: 123 });
    });

    it("should handle discriminated unions", () => {
      const schema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("a"), value: z.string() }),
        z.object({ type: z.literal("b"), value: z.number() }),
      ]);

      const resultA = safeParse(schema, { type: "a", value: "test" });
      expect(resultA).toEqual({ type: "a", value: "test" });

      const resultB = safeParse(schema, { type: "b", value: 123 });
      expect(resultB).toEqual({ type: "b", value: 123 });
    });

    it("should handle lazy schemas", () => {
      interface Tree {
        value: string;
        children: Tree[];
      }
      const treeSchema: z.ZodType<Tree> = z.lazy(() =>
        z.object({
          value: z.string(),
          children: z.array(treeSchema),
        })
      );

      const tree: Tree = {
        value: "root",
        children: [
          { value: "child1", children: [] },
          { value: "child2", children: [] },
        ],
      };

      const result = safeParse(treeSchema, tree);
      expect(result).toEqual(tree);
    });

    it("should handle effects", () => {
      const schema = z
        .string()
        .transform((val) => val.length)
        .pipe(z.number().min(5));

      const result = safeParse(schema, "hello world");
      expect(result).toBe(11);

      expect(() => safeParse(schema, "hi")).toThrow();
    });

    it("should handle branded types", () => {
      const schema = z.string().brand<"UserId">();
      // Test that safeParse accepts unknown values and returns the branded type
      const input: unknown = "user123";
      const result = safeParse(schema, input);
      // Cast expected value to match the branded type
      expect(result).toBe("user123" as z.infer<typeof schema>);
      // Verify the result has the correct type at runtime
      expect(typeof result).toBe("string");
    });

    it("should handle catch with default value", () => {
      const schema = z.string().catch("default");
      // Since safeParse throws on error, we can't test the catch behavior directly
      // but we can verify it works with valid input
      const result = safeParse(schema, "valid");
      expect(result).toBe("valid");
    });

    it("should handle passthrough on objects", () => {
      const schema = z.object({ known: z.string() }).loose();
      const result = safeParse(schema, { known: "value", unknown: "extra" });
      expect(result).toEqual({ known: "value", unknown: "extra" });
    });

    it("should handle strict on objects", () => {
      const schema = z.object({ known: z.string() }).strict();
      expect(() =>
        safeParse(schema, { known: "value", unknown: "extra" })
      ).toThrow();
    });

    it("should handle strip on objects (default behavior)", () => {
      const schema = z.object({ known: z.string() });
      const result = safeParse(schema, { known: "value", unknown: "extra" });
      expect(result).toEqual({ known: "value" });
    });
  });

  describe("type inference", () => {
    it("should correctly infer types", () => {
      const schema = z.object({
        string: z.string(),
        number: z.number(),
        boolean: z.boolean(),
        optional: z.string().optional(),
        nullable: z.string().nullable(),
        array: z.array(z.number()),
        nested: z.object({
          value: z.string(),
        }),
      });

      const result = safeParse(schema, {
        string: "test",
        number: 123,
        boolean: true,
        optional: undefined,
        nullable: null,
        array: [1, 2, 3],
        nested: { value: "nested" },
      });

      // TypeScript should infer the correct type
      expect(typeof result.string).toBe("string");
      expect(typeof result.number).toBe("number");
      expect(typeof result.boolean).toBe("boolean");
      expect(result.optional).toBeUndefined();
      expect(result.nullable).toBeNull();
      expect(Array.isArray(result.array)).toBe(true);
      expect(typeof result.nested.value).toBe("string");
    });
  });
});
