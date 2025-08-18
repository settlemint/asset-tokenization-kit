import { FiatCurrency } from "@/lib/zod/validators/fiat-currency";
/**
 * Type definition for value formatting options
 */
export interface FormatValueOptions {
  type?:
    | "address"
    | "badge"
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
  currency?: FiatCurrency | { assetSymbol: string };

  emptyValue?: React.ReactNode;
  showPrettyName?: boolean;
}

export interface FormatValueProps {
  value: unknown;
  options: FormatValueOptions;
}
