import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading component for dashboard charts.
 *
 * Uses the card surface palette so loading states blend with cards in both
 * themes, avoiding the bright accent flash seen in dark mode.
 */
export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 bg-card/90 dark:bg-card/80" />
        <Skeleton className="h-3 w-48 bg-card/90 dark:bg-card/80" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full rounded-lg border border-border/60 bg-card/95 shadow-inner dark:bg-card/85" />
      </CardContent>
    </Card>
  );
}
