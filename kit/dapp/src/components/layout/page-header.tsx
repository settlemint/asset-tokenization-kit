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
    <div className={cn("relative flex justify-between pb-6", className)}>
      <div>
        {section && <div className="mb-2">{section}</div>}
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
      {button && <div className="h-full">{button}</div>}
    </div>
  );
}
