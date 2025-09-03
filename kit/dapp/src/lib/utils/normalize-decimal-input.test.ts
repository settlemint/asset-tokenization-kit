import { describe, expect, test } from "vitest";
import { normalizeDecimalInput } from "./normalize-decimal-input";

describe("normalizeDecimalInput", () => {
  test("en-US format (comma thousands, period decimal)", () => {
    expect(normalizeDecimalInput("1,234.56", "en-US")).toBe("1234.56");
    expect(normalizeDecimalInput("1,000,000.00", "en-US")).toBe("1000000.00");
    expect(normalizeDecimalInput("1,000,000", "en-US")).toBe("1000000");
    expect(normalizeDecimalInput("0.123", "en-US")).toBe("0.123");
    expect(normalizeDecimalInput("42", "en-US")).toBe("42");
    expect(normalizeDecimalInput(".5", "en-US")).toBe(".5");
    expect(normalizeDecimalInput("1234.56", "en-US")).toBe("1234.56");
  });

  test("de-DE format (period thousands, comma decimal)", () => {
    expect(normalizeDecimalInput("1.234,56", "de-DE")).toBe("1234.56");
    expect(normalizeDecimalInput("1.000.000,00", "de-DE")).toBe("1000000.00");
    expect(normalizeDecimalInput("1.000.000", "de-DE")).toBe("1000000");
    expect(normalizeDecimalInput("0,123", "de-DE")).toBe("0.123");
    expect(normalizeDecimalInput("42", "de-DE")).toBe("42");
    expect(normalizeDecimalInput(",5", "de-DE")).toBe(".5");
    expect(normalizeDecimalInput("1234,56", "de-DE")).toBe("1234.56");
  });

  test("ar-SA format", () => {
    // Arabic uses Arabic comma (٬) for thousands and Arabic decimal (٫) for decimal
    // Arabic-Indic numerals should be converted to ASCII
    expect(normalizeDecimalInput("١٬٢٣٤٫٥٦", "ar-SA")).toBe("1234.56");
    expect(normalizeDecimalInput("١٬٠٠٠٬٠٠٠٫٠٠", "ar-SA")).toBe("1000000.00");
    expect(normalizeDecimalInput("٠٫١٢٣", "ar-SA")).toBe("0.123");
    expect(normalizeDecimalInput("٤٢", "ar-SA")).toBe("42");

    // Also test with ASCII numbers using Arabic separators
    expect(normalizeDecimalInput("1٬234٫56", "ar-SA")).toBe("1234.56");
  });

  test("ja-JP format", () => {
    // Japanese typically uses same format as en-US (comma for thousands, period for decimal)
    expect(normalizeDecimalInput("1,234.56", "ja-JP")).toBe("1234.56");
    expect(normalizeDecimalInput("1,000,000", "ja-JP")).toBe("1000000");
    expect(normalizeDecimalInput("0.123", "ja-JP")).toBe("0.123");
    expect(normalizeDecimalInput("42", "ja-JP")).toBe("42");
  });

  test("handles edge cases", () => {
    // Empty string
    expect(normalizeDecimalInput("", "en-US")).toBe("");

    // Negative numbers
    expect(normalizeDecimalInput("-1,234.56", "en-US")).toBe("-1234.56");
    expect(normalizeDecimalInput("-1.234,56", "de-DE")).toBe("-1234.56");

    // Positive sign
    expect(normalizeDecimalInput("+1,234.56", "en-US")).toBe("+1234.56");
    expect(normalizeDecimalInput("+1.234,56", "de-DE")).toBe("+1234.56");

    // Zero
    expect(normalizeDecimalInput("0", "en-US")).toBe("0");
    expect(normalizeDecimalInput("0.00", "en-US")).toBe("0.00");
    expect(normalizeDecimalInput("0,00", "de-DE")).toBe("0.00");

    // Leading/trailing whitespace preserved
    expect(normalizeDecimalInput(" 1,234.56 ", "en-US")).toBe(" 1234.56 ");

    // Only decimal separator
    expect(normalizeDecimalInput(".", "en-US")).toBe("");
    expect(normalizeDecimalInput(",", "de-DE")).toBe("");

    // Large numbers
    expect(normalizeDecimalInput("1,000,000,000.99", "en-US")).toBe(
      "1000000000.99"
    );
    expect(normalizeDecimalInput("1.000.000.000,99", "de-DE")).toBe(
      "1000000000.99"
    );
  });

  test("handles numbers without decimals", () => {
    expect(normalizeDecimalInput("1,000", "en-US")).toBe("1000");
    expect(normalizeDecimalInput("1.000", "de-DE")).toBe("1000");
    expect(normalizeDecimalInput("42", "en-US")).toBe("42");
    expect(normalizeDecimalInput("42", "de-DE")).toBe("42");
  });

  test("handles numbers without thousands separators", () => {
    expect(normalizeDecimalInput("123456.78", "en-US")).toBe("123456.78");
    expect(normalizeDecimalInput("123,45", "de-DE")).toBe("123.45");
    expect(normalizeDecimalInput("1.23", "en-US")).toBe("1.23");
    expect(normalizeDecimalInput("1,23", "de-DE")).toBe("1.23");
  });

  test("preserves scientific notation", () => {
    expect(normalizeDecimalInput("1e10", "en-US")).toBe("1e10");
    expect(normalizeDecimalInput("1.23e-4", "en-US")).toBe("1.23e-4");
    expect(normalizeDecimalInput("1,23e-4", "de-DE")).toBe("1.23e-4");
  });

  test("removes trailing decimal points for all locales", () => {
    // en-US format - uses period as decimal separator
    expect(normalizeDecimalInput("1234.", "en-US")).toBe("1234");
    expect(normalizeDecimalInput("0.", "en-US")).toBe("0");
    expect(normalizeDecimalInput("1,000.", "en-US")).toBe("1000");
    expect(normalizeDecimalInput("-1234.", "en-US")).toBe("-1234");
    expect(normalizeDecimalInput("+1234.", "en-US")).toBe("+1234");

    // de-DE format - uses comma as decimal separator
    expect(normalizeDecimalInput("1234,", "de-DE")).toBe("1234");
    expect(normalizeDecimalInput("0,", "de-DE")).toBe("0");
    expect(normalizeDecimalInput("1.000,", "de-DE")).toBe("1000");
    expect(normalizeDecimalInput("-1234,", "de-DE")).toBe("-1234");
    expect(normalizeDecimalInput("+1234,", "de-DE")).toBe("+1234");

    // ar-SA format - uses Arabic decimal separator
    expect(normalizeDecimalInput("١٢٣٤٫", "ar-SA")).toBe("1234");
    expect(normalizeDecimalInput("٠٫", "ar-SA")).toBe("0");
    expect(normalizeDecimalInput("١٬٠٠٠٫", "ar-SA")).toBe("1000");
    expect(normalizeDecimalInput("-١٢٣٤٫", "ar-SA")).toBe("-1234");

    // ja-JP format - typically same as en-US
    expect(normalizeDecimalInput("1234.", "ja-JP")).toBe("1234");
    expect(normalizeDecimalInput("0.", "ja-JP")).toBe("0");
    expect(normalizeDecimalInput("1,000.", "ja-JP")).toBe("1000");

    // Edge case - just a decimal separator should remain as is for user experience
    expect(normalizeDecimalInput(".", "en-US")).toBe("");
    expect(normalizeDecimalInput(",", "de-DE")).toBe("");
    expect(normalizeDecimalInput("٫", "ar-SA")).toBe("");
  });
});
