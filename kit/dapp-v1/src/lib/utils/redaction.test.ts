import { describe, expect, it } from "bun:test";
import { redactSensitiveFields } from "./redaction";

describe("redactSensitiveFields", () => {
  it("should return non-object types as is", () => {
    expect(redactSensitiveFields("string")).toBe("string");
    expect(redactSensitiveFields(123)).toBe(123);
    expect(redactSensitiveFields(true)).toBe(true);
    expect(redactSensitiveFields(null)).toBe(null);
    expect(redactSensitiveFields(undefined)).toBe(undefined);
  });

  it("should redact sensitive fields in a flat object", () => {
    const obj = {
      name: "test",
      pincode: "123456",
      verificationCode: "abcdef",
      secretCodes: ["code1", "code2"],
    };
    const expected = {
      name: "test",
      pincode: "******",
      verificationCode: "******",
      secretCodes: "******",
    };
    expect(redactSensitiveFields(obj)).toEqual(expected);
  });

  it("should handle objects without sensitive fields", () => {
    const obj = { name: "test", value: "some-value" };
    expect(redactSensitiveFields(obj)).toEqual(obj);
  });

  it("should handle empty object", () => {
    expect(redactSensitiveFields({})).toEqual({});
  });

  it("should redact sensitive fields in a nested object", () => {
    const obj = {
      user: {
        name: "test",
        credentials: {
          pincode: "123456",
        },
      },
      data: {
        info: "some info",
        auth: {
          verificationCode: "abcdef",
        },
      },
    };
    const expected = {
      user: {
        name: "test",
        credentials: {
          pincode: "******",
        },
      },
      data: {
        info: "some info",
        auth: {
          verificationCode: "******",
        },
      },
    };
    expect(redactSensitiveFields(obj)).toEqual(expected);
  });

  it("should handle arrays of objects", () => {
    const arr = [
      { name: "item1", pincode: "111" },
      { name: "item2", value: "value2" },
      { name: "item3", verificationCode: "abc" },
    ];
    const expected = [
      { name: "item1", pincode: "******" },
      { name: "item2", value: "value2" },
      { name: "item3", verificationCode: "******" },
    ];
    expect(redactSensitiveFields(arr)).toEqual(expected);
  });

  it("should handle arrays of non-objects", () => {
    const arr = ["string", 123, true, null, undefined];
    expect(redactSensitiveFields(arr)).toEqual(arr);
  });

  it("should handle empty array", () => {
    expect(redactSensitiveFields([])).toEqual([]);
  });

  it("should handle complex nested objects with arrays", () => {
    const complexObj = {
      name: "John",
      credentials: {
        pincode: "1234",
        auth: {
          verificationCode: "abc",
        },
      },
      history: [{ action: "login", pincode: "was-used" }, { action: "logout" }],
      secretCodes: ["s1", "s2"],
      other: null,
      metadata: {
        deep: {
          value: "some value",
        },
      },
    };

    const expected = {
      name: "John",
      credentials: {
        pincode: "******",
        auth: {
          verificationCode: "******",
        },
      },
      history: [{ action: "login", pincode: "******" }, { action: "logout" }],
      secretCodes: "******",
      other: null,
      metadata: {
        deep: {
          value: "some value",
        },
      },
    };
    expect(redactSensitiveFields(complexObj)).toEqual(expected);
  });

  it("should not modify the original object", () => {
    const obj = { pincode: "123" };
    redactSensitiveFields(obj);
    expect(obj.pincode).toBe("123");
  });
});
