import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StorageDemoSkeleton() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-5 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Controls Skeleton */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-20" /> {/* Refresh Button */}
            </div>

            {/* FileUploader Skeleton */}
            <Skeleton className="h-32 w-full rounded-md border-2 border-dashed" />

            {/* Table Loading Skeleton */}
            <div className="space-y-2 rounded-md border p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-5 w-20" />
        </CardFooter>
      </Card>
    </div>
  );
}
