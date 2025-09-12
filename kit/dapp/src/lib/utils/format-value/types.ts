import type { FiatCurrency } from "@atk/zod/fiat-currency";

export type FormatType =
  | "address"
  | "currency"
  | "date"
  | "status"
  | "percentage"
  | "number"
  | "text"
  | "boolean"
  | "multiOption"
  | "option"
  | "basisPoints"
  | "none";

/**
 * Type definition for value formatting options
 */
export interface FormatValueOptions {
  type: FormatType;
  displayName?: string;
  currency?: { assetSymbol: string } | FiatCurrency;

  emptyValue?: React.ReactNode;
  showPrettyName?: boolean;

  dateOptions?: FormatDateOptions;
}

export interface FormatValueProps {
  value: unknown;
  options: FormatValueOptions;
}

export interface FormatDateOptions {
  includeTime?: boolean;
  relative?: boolean;
}
