import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatValue } from "@/lib/utils/format-value";
import { safeToString } from "@/lib/utils/format-value/safe-to-string";
import type { FormatValueOptions } from "@/lib/utils/format-value/types";
import { Info } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

export interface DetailGridItemProps extends PropsWithChildren {
  /** The label for the detail item */
  label: string;
  /** Optional tooltip information text */
  info?: string;
  /** Additional CSS classes */
  className?: string;
  /** The value to display (used when children are not provided) */
  value?: unknown;
  /** The type of value for automatic formatting */
  type?: FormatValueOptions["type"];
  /** Optional display name used for formatting hints */
  displayName?: string;
  /** Currency code for currency type formatting */
  currency?: FormatValueOptions["currency"];
  /** Value to display when the value is empty/null/undefined */
  emptyValue?: React.ReactNode;
  /** Options for date formatting */
  dateOptions?: FormatValueOptions["dateOptions"];
  /** Options for address formatting */
  addressOptions?: FormatValueOptions["addressOptions"];
}

/**
 * DetailGridItem component - Display a labeled value with optional tooltip and hover expansion for text
 *
 * @example
 * ```tsx
 * <DetailGridItem label="Contract Address" info="The deployed contract address">
 *   0x1234567890abcdef1234567890abcdef12345678
 * </DetailGridItem>
 * ```
 */
export function DetailGridItem({
  label,
  children,
  info,
  className,
  value,
  type,
  displayName,
  currency,
  emptyValue,
  dateOptions,
  addressOptions,
}: DetailGridItemProps) {
  const { t } = useTranslation("detail-grid");

  // If children are provided, use them. Otherwise, format the value
  const displayContent =
    children ??
    (value !== undefined && type
      ? formatValue(value, {
          type,
          displayName: displayName ?? label,
          currency,
          emptyValue,
          dateOptions,
          addressOptions,
        })
      : safeToString(value ?? ""));

  const isStringContent = typeof displayContent === "string";

  const content = isStringContent ? (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-default truncate text-base">
          {displayContent}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto max-w-[24rem]">
        <div className="break-all font-mono text-sm">{displayContent}</div>
      </HoverCardContent>
    </HoverCard>
  ) : (
    <div className="truncate text-base">{displayContent}</div>
  );

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="size-4 text-muted-foreground hover:text-muted-foreground/80"
                  aria-label={t("info-icon-label")}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {content}
    </div>
  );
}
