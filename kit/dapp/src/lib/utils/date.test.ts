import { describe, expect, test } from "vitest";
import { formatDate, formatDateRange } from "./date";

describe("formatDate", () => {
  const testDate = new Date("2024-03-15T10:30:00Z");

  test("formats date with default format", () => {
    expect(formatDate(testDate)).toBe("Mar 15, 2024");
  });

  test("formats date with custom date-fns format", () => {
    expect(formatDate(testDate, "yyyy-MM-dd")).toBe("2024-03-15");
    expect(formatDate(testDate, "dd/MM/yyyy")).toBe("15/03/2024");
    expect(formatDate(testDate, "EEEE, MMMM do, yyyy")).toBe(
      "Friday, March 15th, 2024"
    );
  });

  test("formats date with Intl.DateTimeFormat options", () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    expect(formatDate(testDate, options, "en-US")).toBe("March 15, 2024");
  });

  test("handles different date input types", () => {
    const dateString = "2024-03-15";
    const timestamp = new Date("2024-03-15").getTime();

    expect(formatDate(dateString)).toBe("Mar 15, 2024");
    expect(formatDate(timestamp)).toBe("Mar 15, 2024");
    expect(formatDate(testDate)).toBe("Mar 15, 2024");
  });

  test("handles different locales with Intl.DateTimeFormat", () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    expect(formatDate(testDate, options, "de-DE")).toMatch(/15\. März 2024/);
    expect(formatDate(testDate, options, "ja-JP")).toMatch(/2024年3月15日/);
  });

  test("formats with date-fns locale for German", () => {
    expect(formatDate(testDate, "d. MMMM yyyy", "de")).toBe("15. März 2024");
  });

  test("formats with date-fns locale for Japanese", () => {
    expect(formatDate(testDate, "yyyy年M月d日", "ja")).toBe("2024年3月15日");
  });

  test("returns Invalid Date for invalid inputs", () => {
    // date-fns throws on invalid dates, so we need to handle them differently
    expect(() => formatDate("invalid-date")).toThrow();
    expect(() => formatDate(Number.NaN)).toThrow();
  });
});

describe("formatDateRange", () => {
  test("formats date range within same month and year", () => {
    const start = new Date("2024-03-10");
    const end = new Date("2024-03-15");
    expect(formatDateRange(start, end)).toBe("Mar 10 - 15, 2024");
  });

  test("formats date range within same year but different months", () => {
    const start = new Date("2024-03-10");
    const end = new Date("2024-05-15");
    expect(formatDateRange(start, end)).toBe("Mar 10 - May 15, 2024");
  });

  test("formats date range across different years", () => {
    const start = new Date("2023-12-25");
    const end = new Date("2024-01-05");
    expect(formatDateRange(start, end)).toBe("Dec 25, 2023 - Jan 5, 2024");
  });

  test("handles different input types", () => {
    const start = "2024-03-10";
    const end = 1_710_518_400_000; // 2024-03-15 timestamp
    expect(formatDateRange(start, end)).toBe("Mar 10 - 15, 2024");
  });

  test("handles same date for start and end", () => {
    const date = new Date("2024-03-15");
    expect(formatDateRange(date, date)).toBe("Mar 15 - 15, 2024");
  });

  test("handles invalid dates", () => {
    // date-fns throws on invalid dates, so we need to handle them differently
    expect(() => formatDateRange("invalid", "invalid")).toThrow();
  });
});
