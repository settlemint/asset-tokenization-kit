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
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PropsWithChildren } from "react";

export interface DetailGridItemProps extends PropsWithChildren {
  /** The label for the detail item */
  label: string;
  /** Optional tooltip information text */
  info?: string;
  /** Additional CSS classes */
  className?: string;
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
}: DetailGridItemProps) {
  const { t } = useTranslation("detail-grid");
  const isStringContent = typeof children === "string";

  const content = isStringContent ? (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-default truncate text-base">{children}</div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto max-w-[24rem]">
        <div className="break-all font-mono text-sm">{children}</div>
      </HoverCardContent>
    </HoverCard>
  ) : (
    <div className="truncate text-base">{children}</div>
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
