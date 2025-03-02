import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export type RelatedGridProps = ComponentPropsWithoutRef<"div">;

export function RelatedGrid({ children, className, title }: RelatedGridProps) {
  return (
    <div className={cn("flex flex-col gap-4 mt-4", className)}>
      {title && <div className="text-xl font-medium text-accent">{title}</div>}
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
