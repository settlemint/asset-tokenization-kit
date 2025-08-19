import { Badge } from "@/components/ui/badge";
import { FormatValueProps } from "@/lib/utils/format-value/types";
import { safeToString } from "./safe-to-string";

export function FormatOption({ value }: FormatValueProps) {
  // For option/multiOption, format as badges or text
  if (Array.isArray(value)) {
    return (
      <div className="flex gap-1 flex-wrap">
        {value.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {safeToString(item)}
          </Badge>
        ))}
      </div>
    );
  }

  return <Badge variant="secondary">{safeToString(value)}</Badge>;
}
