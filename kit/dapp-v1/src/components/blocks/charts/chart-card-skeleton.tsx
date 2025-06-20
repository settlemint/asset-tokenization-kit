import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 bg-muted/50" />
        <Skeleton className="mt-1 h-4 w-1/2 bg-muted/50" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full bg-muted/50" />
      </CardContent>
    </Card>
  );
}
