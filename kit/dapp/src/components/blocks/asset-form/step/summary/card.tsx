import type { PropsWithChildren, ReactNode } from 'react';

interface AssetFormSummaryDetailCardProps extends PropsWithChildren {
  icon: ReactNode;
}

export function AssetFormSummaryDetailCard({ children, icon }: AssetFormSummaryDetailCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">{icon}</div>
          <div>
            <h3 className="font-semibold text-sm">Action details</h3>
            <p className="text-muted-foreground text-xs">Details of the action you are about to perform.</p>
          </div>
        </div>
        <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">{children}</dl>
      </div>
    </div>
  );
}
