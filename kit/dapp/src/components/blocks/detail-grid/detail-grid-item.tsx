import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

interface DetailGridItemProps extends PropsWithChildren {
  label: string;
  info?: string;
  className?: string;
}

export function DetailGridItem({ label, children, info, className }: DetailGridItemProps) {
  const t = useTranslations("components.detail-grid");

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground text-sm">
          {label}
        </span>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="size-4 text-muted-foreground"
                  aria-label={t("info-icon-label")}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-accent-foreground text-xs">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="text-md">{children}</div>
    </div>
  );
}
