import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export interface RelatedGridProps extends ComponentPropsWithoutRef<"div"> {
  title?: string;
}

/**
 * RelatedGrid component - Container for related content items
 *
 * @example
 * ```tsx
 * <RelatedGrid title="Related Actions">
 *   <RelatedGridItem title="Create New" description="Start a new token">
 *     <Button>Create</Button>
 *   </RelatedGridItem>
 * </RelatedGrid>
 * ```
 */
export function RelatedGrid({ children, className, title }: RelatedGridProps) {
  return (
    <div className={cn("mt-4 flex flex-col gap-4", className)}>
      {title && <div className="font-medium text-accent text-xl">{title}</div>}
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-1 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
