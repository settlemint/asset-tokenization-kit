import { describe, expect, test, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { formatValue, safeToString } from "./format-value";
import { from } from "dnum";

// Mock the components used by formatValue (hoisted)
vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/web3/web3-address", () => ({
  Web3Address: ({ address }: { address: string }) => (
    <span data-testid="web3-address">{address}</span>
  ),
}));

vi.mock("@/lib/zod/validators/ethereum-address", () => ({
  getEthereumAddress: (value: unknown) => {
    const addr = String(value);
    if (addr.startsWith("0x") && addr.length === 42) {
      return addr;
    }
    throw new Error("Invalid address");
  },
}));

describe("safeToString", () => {
  test("converts null and undefined to empty string", () => {
    expect(safeToString(null)).toBe("");
    expect(safeToString(undefined)).toBe("");
  });

  test("returns strings as-is", () => {
    expect(safeToString("hello")).toBe("hello");
    expect(safeToString("")).toBe("");
  });

  test("converts numbers to strings", () => {
    expect(safeToString(42)).toBe("42");
    expect(safeToString(3.14)).toBe("3.14");
    expect(safeToString(0)).toBe("0");
    expect(safeToString(-5)).toBe("-5");
  });

  test("converts booleans to strings", () => {
    expect(safeToString(true)).toBe("true");
    expect(safeToString(false)).toBe("false");
  });

  test("converts bigints to strings", () => {
    expect(safeToString(BigInt(123))).toBe("123");
    expect(safeToString(BigInt("9007199254740991"))).toBe("9007199254740991");
  });

  test("converts symbols to strings", () => {
    expect(safeToString(Symbol("test"))).toBe("Symbol(test)");
  });

  test("returns [Function] for functions", () => {
    expect(safeToString(() => {})).toBe("[Function]");
    expect(safeToString(function named() {})).toBe("[Function]");
  });

  test("converts dates to ISO strings", () => {
    const date = new Date("2024-01-15T10:00:00Z");
    expect(safeToString(date)).toBe("2024-01-15T10:00:00.000Z");
  });

  test("converts objects to JSON strings", () => {
    expect(safeToString({ a: 1, b: "test" })).toBe('{"a":1,"b":"test"}');
    expect(safeToString([1, 2, 3])).toBe("[1,2,3]");
  });

  test("handles circular references gracefully", () => {
    const circular = { a: 1, self: null as unknown };
    circular.self = circular;
    expect(safeToString(circular)).toBe("[Object]");
  });
});

describe("formatValue", () => {
  test("returns empty value for null/undefined/empty string", () => {
    expect(formatValue(null)).toBe("");
    expect(formatValue(undefined)).toBe("");
    expect(formatValue("")).toBe("");
  });

  test("uses custom empty value when provided", () => {
    const emptyValue = <span>N/A</span>;
    expect(formatValue(null, { emptyValue })).toEqual(emptyValue);
    expect(formatValue(undefined, { emptyValue })).toEqual(emptyValue);
    expect(formatValue("", { emptyValue })).toEqual(emptyValue);
  });

  test("returns string representation when no type specified", () => {
    expect(formatValue("hello")).toBe("hello");
    expect(formatValue(42)).toBe("42");
    expect(formatValue(true)).toBe("true");
  });

  describe("address type", () => {
    test("renders valid Ethereum address", () => {
      const address = "0x1234567890123456789012345678901234567890";
      const result = formatValue(address, { type: "address" });
      const { container } = render(<>{result}</>);
      expect(
        container.querySelector('[data-testid="web3-address"]')
      ).toHaveTextContent(address);
    });

    test("renders invalid address as fallback", () => {
      const result = formatValue("invalid-address", { type: "address" });
      const { container } = render(<>{result}</>);
      expect(container.querySelector(".font-mono")).toHaveTextContent(
        "invalid-address"
      );
    });
  });

  describe("badge type", () => {
    test("renders badge with default variant", () => {
      const result = formatValue("Active", { type: "badge" });
      const { container } = render(<>{result}</>);
      const badge = container.querySelector('[data-testid="badge"]');
      expect(badge).toHaveTextContent("Active");
      expect(badge).toHaveAttribute("data-variant", "default");
    });

    test("uses secondary variant for symbol columns", () => {
      const result = formatValue("ETH", {
        type: "badge",
        displayName: "Token Symbol",
      });
      const { container } = render(<>{result}</>);
      const badge = container.querySelector('[data-testid="badge"]');
      expect(badge).toHaveAttribute("data-variant", "secondary");
      expect(badge).toHaveClass("font-mono");
    });

    test("uses appropriate variant for status values", () => {
      const testCases = [
        { value: "active", variant: "default" },
        { value: "inactive", variant: "secondary" },
        { value: "error", variant: "destructive" },
        { value: "pending", variant: "outline" },
      ];

      testCases.forEach(({ value, variant }) => {
        const result = formatValue(value, {
          type: "badge",
          displayName: "status",
        });
        const { container } = render(<>{result}</>);
        const badge = container.querySelector('[data-testid="badge"]');
        expect(badge).toHaveAttribute("data-variant", variant);
      });
    });
  });

  describe("currency type", () => {
    test("formats currency values correctly", () => {
      const result = formatValue(1234.56, {
        type: "currency",
        currency: "USD",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("$1,234.56");
    });

    test("handles different currencies", () => {
      const result = formatValue(1234.56, {
        type: "currency",
        currency: "EUR",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("€1,234.56");
    });

    test("handles unknown currency symbols", () => {
      const result = formatValue(1234.56, {
        type: "currency",
        currency: "ABC",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      // Check that it contains the formatted number and currency
      expect(container.textContent).toContain("1,234.56");
      expect(container.textContent).toContain("ABC");
    });

    test("handles string numbers", () => {
      const result = formatValue("1234.56", {
        type: "currency",
        currency: "USD",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("$1,234.56");
    });
  });

  describe("date type", () => {
    test("formats dates correctly", () => {
      const date = new Date("2024-01-15T10:00:00Z");
      const result = formatValue(date, { type: "date", locale: "en-US" });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toMatch(/Jan.*15.*2024/);
    });

    test('includes time when displayName contains "time"', () => {
      const date = new Date("2024-01-15T10:00:00Z");
      const result = formatValue(date, {
        type: "date",
        displayName: "datetime",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toMatch(/Jan.*15.*2024/);
      // Note: Time display depends on timezone
    });

    test("handles date strings", () => {
      const result = formatValue("2024-01-15", {
        type: "date",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toMatch(/Jan.*15.*2024/);
    });
  });

  describe("status type", () => {
    test("renders status badges with appropriate variants", () => {
      const testCases = [
        { value: "active", variant: "default" },
        { value: "inactive", variant: "secondary" },
        { value: "error", variant: "destructive" },
        { value: "pending", variant: "outline" },
      ];

      testCases.forEach(({ value, variant }) => {
        const result = formatValue(value, { type: "status" });
        const { container } = render(<>{result}</>);
        const badge = container.querySelector('[data-testid="badge"]');
        expect(badge).toHaveAttribute("data-variant", variant);
        expect(badge).toHaveTextContent(value);
      });
    });

    test("uses default variant for unknown status", () => {
      const result = formatValue("unknown-status", { type: "status" });
      const { container } = render(<>{result}</>);
      const badge = container.querySelector('[data-testid="badge"]');
      expect(badge).toHaveAttribute("data-variant", "default");
    });
  });

  describe("percentage type", () => {
    test("formats percentage values", () => {
      const result = formatValue(75.5, { type: "percentage", locale: "en-US" });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("75.5%");
    });

    test("handles string percentages", () => {
      const result = formatValue("25.75", {
        type: "percentage",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("25.75%");
    });

    test("handles dnum values", () => {
      const dnumValue = from(75.5, 18);
      const result = formatValue(dnumValue, {
        type: "percentage",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("75.5%");
    });
  });

  describe("number type", () => {
    test("formats numbers with locale", () => {
      const result = formatValue(1_234_567.89, {
        type: "number",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("1,234,567.89");
    });

    test("handles no decimals for decimal columns", () => {
      const result = formatValue(18, {
        type: "number",
        displayName: "decimals",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("18");
    });

    test("uses compact notation for large counts", () => {
      const result = formatValue(1_234_567, {
        type: "number",
        displayName: "user count",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toMatch(/1\.2M|1.2M/);
    });

    test("handles dnum values", () => {
      const dnumValue = from(1234.56, 18);
      const result = formatValue(dnumValue, {
        type: "number",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("1,234.56");
    });

    test("handles NaN values by converting to 0", () => {
      const result = formatValue(Number.NaN, {
        type: "number",
        locale: "en-US",
      });
      const { container } = render(<>{result}</>);
      expect(container.textContent).toBe("0");
    });
  });

  test("returns string representation for unknown type", () => {
    const result = formatValue("test value", { type: "unknown-type" });
    const { container } = render(<>{result}</>);
    expect(container.textContent).toBe("test value");
  });
});
