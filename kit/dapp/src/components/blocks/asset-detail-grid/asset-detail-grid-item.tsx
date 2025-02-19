import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import type { PropsWithChildren } from 'react';

interface AssetDetailGridItemProps extends PropsWithChildren {
  label: string;
  info?: string;
  isLoading?: boolean;
}

export function AssetDetailGridItemSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function AssetDetailGridItem({ label, children, info, isLoading }: AssetDetailGridItemProps) {
  if (isLoading) {
    return <AssetDetailGridItemSkeleton />;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground text-sm">{label}</span>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-accent-foreground text-xs">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="text-md">{children}</div>
    </div>
  );
}
