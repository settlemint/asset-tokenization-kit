import CollapsedBreadcrumbs from '@/components/blocks/collapsed-breadcrumb/collapsed-breadcrumb';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  pill?: ReactNode;
  button?: ReactNode;
}

export function PageHeader({ title, subtitle, pill, button }: PageHeaderProps) {
  return (
    <div className="relative flex justify-between pb-8">
      <div>
        <CollapsedBreadcrumbs hideRoot={true} />
        <h1 className="flex items-center font-bold text-2xl">
          {title}
          {pill && <div className="ml-2 flex items-center gap-2 font-normal text-base">{pill}</div>}
        </h1>
        {subtitle && <div className="mt-1 text-muted-foreground text-sm">{subtitle}</div>}
      </div>
      {button && <div className="h-full">{button}</div>}
    </div>
  );
}
