import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormatValueProps } from "@/lib/utils/format-value/types";
import { safeToString } from "./safe-to-string";

export function FormatOption({ value, options }: FormatValueProps) {
  const { multiOptionOptions } = options;
  // For option/multiOption, format as badges or text
  if (Array.isArray(value)) {
    return (
      <div className="flex gap-1 flex-wrap">
        {value.map((item, index) => {
          const description = multiOptionOptions?.getDescription?.(item);
          const badge = (
            <Badge key={index} variant="secondary" className="text-xs">
              {multiOptionOptions?.getLabel?.(item) ?? safeToString(item)}
            </Badge>
          );
          if (description) {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>{badge}</TooltipTrigger>
                <TooltipContent>{description}</TooltipContent>
              </Tooltip>
            );
          }
          return badge;
        })}
      </div>
    );
  }

  return <Badge variant="secondary">{safeToString(value)}</Badge>;
}
