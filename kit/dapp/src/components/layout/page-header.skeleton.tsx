import { cn } from "@/lib/utils";

export function PageHeaderSkeleton({
  section,
  className,
}: {
  section?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative pb-6", className)}>
      {section && (
        <div className="mb-1 h-3.5 w-24 animate-pulse rounded-md bg-muted" />
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        {/* Optionally add a button skeleton if the original might have one */}
        {/* <Skeleton className="h-10 w-24" /> */}
      </div>
    </div>
  );
}
