import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-3/4 bg-muted/50" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-1/2 bg-muted/50" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-full bg-muted/50" />
      </CardFooter>
    </Card>
  );
}
