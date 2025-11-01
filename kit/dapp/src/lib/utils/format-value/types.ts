import type { Web3AddressProps } from "@/components/web3/web3-address";
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

  addressOptions?: FormatAddressOptions;
  dateOptions?: FormatDateOptions;
  multiOptionOptions?: FormatMultiOptionOptions;

  compact?: boolean;

  className?: string;
}

export interface FormatValueProps {
  value: unknown;
  options: FormatValueOptions;
}

export interface FormatDateOptions {
  includeTime?: boolean;
  relative?: boolean;
}

export type FormatAddressOptions = Omit<Web3AddressProps, "address">;

export interface FormatMultiOptionOptions {
  getLabel?(value: unknown): string;
  getDescription?(value: unknown): string;
}
