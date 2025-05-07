import { Skeleton } from "@/components/ui/skeleton";
import { StorageDemoSkeleton } from "./_components/storage-demo.skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-9 w-48" /> {/* Title */}
          <Skeleton className="mt-1 h-5 w-80" /> {/* Subtitle */}
        </div>
        <StorageDemoSkeleton />
      </div>
    </div>
  );
}
