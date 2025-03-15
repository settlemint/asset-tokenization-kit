import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  pill?: ReactNode;
  button?: ReactNode;
  section?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  pill,
  button,
  className,
  section,
}: PageHeaderProps) {
  return (
    <div className={cn("relative pb-6", className)}>
      {section && (
        <div className="mb-1 text-xs text-muted-foreground">{section}</div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="flex items-center font-bold text-2xl">
            {title}
            {pill && (
              <div className="ml-2 flex items-center gap-2 font-normal text-base">
                {pill}
              </div>
            )}
          </h1>
          {subtitle && (
            <div className="mt-1 text-muted-foreground text-sm">{subtitle}</div>
          )}
        </div>
        {button && <div>{button}</div>}
      </div>
    </div>
  );
}
