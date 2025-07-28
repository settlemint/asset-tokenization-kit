import { Skeleton } from "@/components/ui/skeleton";

export function RecoveryCodesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-[60px] w-full" />
        ))}
      </div>
    </div>
  );
}
