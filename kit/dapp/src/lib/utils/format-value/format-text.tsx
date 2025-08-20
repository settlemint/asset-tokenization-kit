import { FormatValueProps } from "@/lib/utils/format-value/types";
import { safeToString } from "./safe-to-string";

export function FormatText({ value }: FormatValueProps) {
  return <span>{safeToString(value)}</span>;
}
