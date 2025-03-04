import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export type ChartGridProps = ComponentPropsWithoutRef<"div">;

export function ChartGrid({ children, className, title }: ChartGridProps) {
  return (
    <div className={cn("flex flex-col gap-4 mt-4", className)}>
      {title && <div className="text-xl font-medium text-accent">{title}</div>}
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}
