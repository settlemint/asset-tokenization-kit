/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { determineNewOperator } from "./operator-utils";
import type { NumberFilterOperator } from "../types/filter-types";

describe("operator-utils", () => {
  describe("determineNewOperator", () => {
    describe("text operators", () => {
      it("should maintain operator when array lengths are equal", () => {
        expect(
          determineNewOperator("text", ["hello"], ["world"], "contains")
        ).toBe("contains");
        expect(
          determineNewOperator(
            "text",
            ["hello", "world"],
            ["foo", "bar"],
            "does not contain"
          )
        ).toBe("does not contain");
      });

      it("should maintain operator when both arrays have multiple values", () => {
        expect(
          determineNewOperator("text", ["a", "b"], ["c", "d", "e"], "contains")
        ).toBe("contains");
        expect(
          determineNewOperator(
            "text",
            ["a", "b", "c"],
            ["d", "e"],
            "does not contain"
          )
        ).toBe("does not contain");
      });

      it("should maintain operator when both arrays have single or no values", () => {
        expect(determineNewOperator("text", [], ["a"], "contains")).toBe(
          "contains"
        );
        expect(determineNewOperator("text", ["a"], [], "contains")).toBe(
          "contains"
        );
        expect(determineNewOperator("text", [], [], "does not contain")).toBe(
          "does not contain"
        );
      });

      it("should handle operator transitions for text type", () => {
        // Text operators don't have singular/plural forms, so they should maintain
        expect(
          determineNewOperator("text", ["a"], ["b", "c"], "contains")
        ).toBe("contains");
        expect(
          determineNewOperator("text", ["a", "b"], ["c"], "does not contain")
        ).toBe("does not contain");
      });
    });

    describe("number operators", () => {
      // Number operators don't have singularOf/pluralOf mappings
      it("should maintain number operators as they don't have singular/plural mappings", () => {
        expect(determineNewOperator("number", [1], [2, 3], "is")).toBe("is");
        expect(determineNewOperator("number", [1, 2], [3], "is")).toBe("is");
        expect(determineNewOperator("number", [1], [2, 3], "is not")).toBe(
          "is not"
        );
      });

      it("should maintain comparison operators", () => {
        expect(
          determineNewOperator("number", [1], [2, 3], "is less than")
        ).toBe("is less than");
        expect(
          determineNewOperator("number", [1], [2, 3], "is greater than")
        ).toBe("is greater than");
        expect(
          determineNewOperator(
            "number",
            [1],
            [2, 3],
            "is less than or equal to"
          )
        ).toBe("is less than or equal to");
        expect(
          determineNewOperator(
            "number",
            [1],
            [2, 3],
            "is greater than or equal to"
          )
        ).toBe("is greater than or equal to");
      });

      it("should maintain range operators", () => {
        expect(
          determineNewOperator("number", [1, 2], [3, 4, 5], "is between")
        ).toBe("is between");
        expect(
          determineNewOperator("number", [1, 2, 3], [4, 5], "is not between")
        ).toBe("is not between");
      });
    });

    describe("date operators", () => {
      it("should transition 'is' to 'is between' when going from single to multiple", () => {
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01")],
            [new Date("2023-01-02"), new Date("2023-01-03")],
            "is"
          )
        ).toBe("is between");
      });

      it("should transition 'is between' to 'is' when going from multiple to single", () => {
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01"), new Date("2023-01-02")],
            [new Date("2023-01-01")],
            "is between"
          )
        ).toBe("is");
      });

      it("should transition 'is not' to 'is not between' when going from single to multiple", () => {
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01")],
            [new Date("2023-01-02"), new Date("2023-01-03")],
            "is not"
          )
        ).toBe("is not between");
      });

      it("should transition 'is not between' to 'is not' when going from multiple to single", () => {
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01"), new Date("2023-01-02")],
            [new Date("2023-01-01")],
            "is not between"
          )
        ).toBe("is not");
      });

      it("should transition comparison operators to 'is between'", () => {
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01")],
            [new Date("2023-01-02"), new Date("2023-01-03")],
            "is before"
          )
        ).toBe("is between");
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01")],
            [new Date("2023-01-02"), new Date("2023-01-03")],
            "is after"
          )
        ).toBe("is between");
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01")],
            [new Date("2023-01-02"), new Date("2023-01-03")],
            "is on or before"
          )
        ).toBe("is between");
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01")],
            [new Date("2023-01-02"), new Date("2023-01-03")],
            "is on or after"
          )
        ).toBe("is between");
      });

      it("should maintain date range operators when both have multiple values", () => {
        expect(
          determineNewOperator(
            "date",
            [new Date("2023-01-01"), new Date("2023-01-31")],
            [
              new Date("2023-02-01"),
              new Date("2023-02-28"),
              new Date("2023-03-01"),
            ],
            "is between"
          )
        ).toBe("is between");
      });
    });

    describe("option operators", () => {
      it("should transition 'is' to 'is not' when going from single to multiple", () => {
        // According to option-operators.ts, "is" has singularOf: "is not"
        expect(
          determineNewOperator("option", ["red"], ["blue", "green"], "is")
        ).toBe("is not");
      });

      it("should transition 'is any of' to 'is' when going from multiple to single", () => {
        expect(
          determineNewOperator(
            "option",
            ["red", "blue"],
            ["green"],
            "is any of"
          )
        ).toBe("is");
      });

      it("should transition 'is not' to 'is' when going from single to multiple", () => {
        // According to option-operators.ts, "is not" has singularOf: "is"
        expect(
          determineNewOperator("option", ["red"], ["blue", "green"], "is not")
        ).toBe("is");
      });

      it("should transition 'is none of' to 'is not' when going from multiple to single", () => {
        expect(
          determineNewOperator(
            "option",
            ["red", "blue"],
            ["green"],
            "is none of"
          )
        ).toBe("is not");
      });
    });

    describe("multiOption operators", () => {
      it("should transition 'include' to 'include any of' when going from single to multiple", () => {
        expect(
          determineNewOperator(
            "multiOption",
            [["tag1"]],
            [["tag2"], ["tag3"]],
            "include"
          )
        ).toBe("include any of");
      });

      it("should transition 'include any of' to 'include' when going from multiple to single", () => {
        expect(
          determineNewOperator(
            "multiOption",
            [["tag1"], ["tag2"]],
            [["tag3"]],
            "include any of"
          )
        ).toBe("include");
      });

      it("should transition 'exclude' to 'exclude if any of' when going from single to multiple", () => {
        expect(
          determineNewOperator(
            "multiOption",
            [["tag1"]],
            [["tag2"], ["tag3"]],
            "exclude"
          )
        ).toBe("exclude if any of");
      });

      it("should transition 'exclude if any of' to 'exclude' when going from multiple to single", () => {
        expect(
          determineNewOperator(
            "multiOption",
            [["tag1"], ["tag2"]],
            [["tag3"]],
            "exclude if any of"
          )
        ).toBe("exclude");
      });

      it("should transition 'exclude if all' to 'exclude' when going from multiple to single", () => {
        expect(
          determineNewOperator(
            "multiOption",
            [["tag1"], ["tag2"]],
            [["tag3"]],
            "exclude if all"
          )
        ).toBe("exclude");
      });

      it("should maintain 'include all of' operator when both have multiple values", () => {
        expect(
          determineNewOperator(
            "multiOption",
            [["tag1", "tag2"]],
            [["tag3", "tag4"]],
            "include all of"
          )
        ).toBe("include all of");
      });

      it("should maintain 'exclude if all' operator when both have multiple values", () => {
        expect(
          determineNewOperator(
            "multiOption",
            [["tag1", "tag2"]],
            [["tag3", "tag4"]],
            "exclude if all"
          )
        ).toBe("exclude if all");
      });
    });

    describe("edge cases", () => {
      it("should handle empty arrays", () => {
        expect(determineNewOperator("text", [], [], "contains")).toBe(
          "contains"
        );
        expect(determineNewOperator("number", [], [], "is")).toBe("is");
      });

      it("should handle very large array transitions", () => {
        const largeOld = Array.from({ length: 10 }).fill("option") as string[];
        const largeSingle = ["option"];

        // For option type with "is any of" -> single value
        expect(
          determineNewOperator("option", largeOld, largeSingle, "is any of")
        ).toBe("is");
      });

      it("should handle operators without singular/plural mappings", () => {
        // Number operators don't have mappings, so they should remain unchanged
        expect(determineNewOperator("number", [1], [2, 3], "is between")).toBe(
          "is between"
        );

        // This is an invalid date value for the operator, but testing edge case
        expect(
          determineNewOperator(
            "date",
            [new Date(1), new Date(2), new Date(3)],
            [new Date(4)],
            "is before"
          )
        ).toBe("is before");
      });

      it("should handle all array length transition scenarios", () => {
        // 0 -> 0 (no change)
        expect(determineNewOperator("text", [], [], "contains")).toBe(
          "contains"
        );

        // 0 -> 1 (still single)
        expect(determineNewOperator("number", [], [1], "is")).toBe("is");

        // 0 -> 2+ (single to multiple) - for date type which has mappings
        expect(
          determineNewOperator(
            "date",
            [],
            [new Date("2023-01-01"), new Date("2023-01-02")],
            "is"
          )
        ).toBe("is between");

        // 1 -> 0 (still single)
        expect(determineNewOperator("number", [1], [], "is")).toBe("is");

        // 1 -> 1 (no change)
        expect(determineNewOperator("number", [1], [2], "is")).toBe("is");

        // 1 -> 2+ (single to multiple) - for option type
        expect(
          determineNewOperator("option", ["red"], ["blue", "green"], "is")
        ).toBe(
          "is not" // Based on the mapping in option-operators.ts
        );

        // 2+ -> 0 (multiple to single) - for option type
        expect(
          determineNewOperator("option", ["red", "blue"], [], "is any of")
        ).toBe("is");

        // 2+ -> 1 (multiple to single)
        expect(
          determineNewOperator(
            "option",
            ["red", "blue"],
            ["green"],
            "is any of"
          )
        ).toBe("is");

        // 2+ -> 2+ (no change)
        expect(
          determineNewOperator(
            "option",
            ["red", "blue"],
            ["green", "yellow"],
            "is any of"
          )
        ).toBe("is any of");
      });

      it("should handle missing operator details", () => {
        // If operator is not found in the mapping, the code will throw an error
        // because it tries to access singularOf on undefined
        // This is a potential bug in the implementation
        expect(() =>
          determineNewOperator(
            "number",
            [1],
            [2, 3],
            "is any of" as unknown as NumberFilterOperator
          )
        ).toThrow();
      });
    });
  });
});
