import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyAirdropsLoading() {
  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <DataTableSkeleton />
        </CardContent>
      </Card>
    </>
  );
}
