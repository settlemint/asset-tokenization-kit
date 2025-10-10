import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export interface DetailGridProps extends ComponentPropsWithoutRef<typeof Card> {
  title?: string;
}

/**
 * DetailGrid component - A responsive grid layout for displaying detailed information in a card format
 * with built-in error boundary support using ComponentErrorBoundary
 *
 * @example
 * ```tsx
 * <DetailGrid title="Token Details">
 *   <DetailGridItem label="Symbol" info="The token's trading symbol">
 *     BTC
 *   </DetailGridItem>
 *   <DetailGridItem label="Total Supply">
 *     1,000,000
 *   </DetailGridItem>
 * </DetailGrid>
 * ```
 */
export const DetailGrid = withErrorBoundary(function DetailGrid({
  children,
  className,
  title,
  ...props
}: DetailGridProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {title && <h2 className="text-xl font-medium text-accent">{title}</h2>}
      <Card {...props}>
        <CardContent className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {children}
        </CardContent>
      </Card>
    </div>
  );
});
