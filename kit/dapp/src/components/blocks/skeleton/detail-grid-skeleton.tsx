import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DetailGridSkeleton() {
  return (
    <div className={cn("mt-4 flex flex-col gap-4")}>
      <div className="font-medium text-accent text-xl">
        <Skeleton className="h-full w-8 bg-muted/50" />
      </div>
      <Card>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-8 ">
          <Skeleton className="h-8 w-full bg-muted/50" />
          <Skeleton className="h-8 w-full bg-muted/50" />
        </CardContent>
      </Card>
    </div>
  );
}
