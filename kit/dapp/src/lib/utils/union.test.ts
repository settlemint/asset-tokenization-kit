import { describe, test } from "vitest";
import { expectTypeOf } from "vitest";
import type { KeysOfUnion } from "./union";

describe("KeysOfUnion", () => {
  test("extracts keys from simple union types", () => {
    type Union = { a: string } | { b: number };
    type Keys = KeysOfUnion<Union>;

    // Keys should be 'a' | 'b'
    expectTypeOf<Keys>().toEqualTypeOf<"a" | "b">();
  });

  test("handles unions with overlapping keys", () => {
    type Union =
      | { a: string; common: boolean }
      | { b: number; common: boolean };
    type Keys = KeysOfUnion<Union>;

    // Keys should include all keys from all union members
    expectTypeOf<Keys>().toEqualTypeOf<"a" | "b" | "common">();
  });

  test("works with discriminated unions", () => {
    type Action =
      | { type: "increment"; value: number }
      | { type: "decrement"; value: number }
      | { type: "reset" };

    type Keys = KeysOfUnion<Action>;

    // Should include all keys from all variants
    expectTypeOf<Keys>().toEqualTypeOf<"type" | "value">();
  });

  test("handles empty object in union", () => {
    type Union = { a: string } | object;
    type Keys = KeysOfUnion<Union>;

    // Keys should be just 'a' since object has no known keys
    expectTypeOf<Keys>().toEqualTypeOf<"a">();
  });

  test("works with multiple union members", () => {
    type Union = { a: string } | { b: number } | { c: boolean } | { d: object };

    type Keys = KeysOfUnion<Union>;

    expectTypeOf<Keys>().toEqualTypeOf<"a" | "b" | "c" | "d">();
  });

  test("handles nested objects in union", () => {
    type Union =
      | { user: { name: string; age: number } }
      | { product: { id: string; price: number } };

    type Keys = KeysOfUnion<Union>;

    // Only top-level keys
    expectTypeOf<Keys>().toEqualTypeOf<"user" | "product">();
  });

  test("works with literal types in union", () => {
    type Union =
      | { kind: "circle"; radius: number }
      | { kind: "square"; size: number }
      | { kind: "rectangle"; width: number; height: number };

    type Keys = KeysOfUnion<Union>;

    expectTypeOf<Keys>().toEqualTypeOf<
      "kind" | "radius" | "size" | "width" | "height"
    >();
  });

  test("handles optional properties in union", () => {
    type Union =
      | { required: string; optional?: number }
      | { required: string; different?: boolean };

    type Keys = KeysOfUnion<Union>;

    expectTypeOf<Keys>().toEqualTypeOf<"required" | "optional" | "different">();
  });

  test("works with single type (not actually a union)", () => {
    type NotUnion = { a: string; b: number };
    type Keys = KeysOfUnion<NotUnion>;

    expectTypeOf<Keys>().toEqualTypeOf<"a" | "b">();
  });

  test("practical example with form field types", () => {
    type FormField =
      | { type: "text"; value: string; placeholder?: string }
      | { type: "number"; value: number; min?: number; max?: number }
      | { type: "select"; value: string; options: string[] }
      | { type: "checkbox"; checked: boolean };

    type AllFormFieldKeys = KeysOfUnion<FormField>;

    expectTypeOf<AllFormFieldKeys>().toEqualTypeOf<
      "type" | "value" | "placeholder" | "min" | "max" | "options" | "checked"
    >();
  });
});
