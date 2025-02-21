import { cn } from '@/lib/utils';

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex justify-between pb-6', className)}>
      <div>
        <div className="mb-2 h-6">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <h1 className="flex items-center">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="ml-2 h-6 w-24 animate-pulse rounded bg-muted" />
        </h1>
        <div className="mt-1">
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-full">
        <div className="h-9 w-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
