import type { FiatCurrency } from "@/lib/zod/validators/fiat-currency";

/**
 * Type definition for value formatting options
 */
export interface FormatValueOptions {
  type?:
    | "address"
    | "currency"
    | "date"
    | "status"
    | "percentage"
    | "number"
    | "text"
    | "boolean"
    | "multiOption"
    | "option";
  displayName?: string;
  currency?: { assetSymbol: string } | FiatCurrency;

  emptyValue?: React.ReactNode;
  showPrettyName?: boolean;
}

export interface FormatValueProps {
  value: unknown;
  options: FormatValueOptions;
}
