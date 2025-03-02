import type { PropsWithChildren, ReactNode } from "react";

interface FormSummaryDetailCardProps extends PropsWithChildren {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FormSummaryDetailCard({
  children,
  title,
  description,
  icon,
}: FormSummaryDetailCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
        </div>
        <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
          {children}
        </dl>
      </div>
    </div>
  );
}
