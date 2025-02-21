import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import * as React from 'react';

const AssetFormSummary = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('space-y-6', className)} {...props} />
);
AssetFormSummary.displayName = 'AssetFormSummary';

const AssetFormSummaryTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h2 ref={ref} className={cn('font-semibold text-base', className)} {...props} />
);
AssetFormSummaryTitle.displayName = 'AssetFormSummaryTitle';

const AssetFormSummarySubTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-muted-foreground text-xs', className)} {...props} />
  )
);
AssetFormSummarySubTitle.displayName = 'AssetFormSummarySubTitle';

const AssetFormSummarySection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border bg-card p-4', className)} {...props} />
  )
);
AssetFormSummarySection.displayName = 'AssetFormSummarySection';

interface AssetFormSummarySectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}

const AssetFormSummarySectionHeader = React.forwardRef<HTMLDivElement, AssetFormSummarySectionHeaderProps>(
  ({ className, icon = <Lock className="h-3 w-3 text-primary" />, ...props }, ref) => (
    <div ref={ref} className={cn('mb-3 flex items-center gap-2', className)} {...props}>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">{icon}</div>
      <div>{props.children}</div>
    </div>
  )
);
AssetFormSummarySectionHeader.displayName = 'AssetFormSummarySectionHeader';

const AssetFormSummarySectionTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn('font-semibold text-sm', className)} {...props} />
);
AssetFormSummarySectionTitle.displayName = 'AssetFormSummarySectionTitle';

const AssetFormSummarySectionSubTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-muted-foreground text-xs', className)} {...props} />
));
AssetFormSummarySectionSubTitle.displayName = 'AssetFormSummarySectionSubTitle';

const AssetFormSummaryContent = React.forwardRef<HTMLDListElement, React.HTMLAttributes<HTMLDListElement>>(
  ({ className, ...props }, ref) => (
    <dl ref={ref} className={cn('space-y-2 [&>div:last-child]:border-0 [&>div]:border-b', className)} {...props} />
  )
);
AssetFormSummaryContent.displayName = 'AssetFormSummaryContent';

export {
  AssetFormSummary,
  AssetFormSummaryTitle,
  AssetFormSummarySubTitle,
  AssetFormSummarySection,
  AssetFormSummarySectionHeader,
  AssetFormSummarySectionTitle,
  AssetFormSummarySectionSubTitle,
  AssetFormSummaryContent,
};
