import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import type { PropsWithChildren } from 'react';

interface AssetDetailGridItemProps extends PropsWithChildren {
  label: string;
  info?: string;
}

export function AssetDetailGridItem({ label, children, info }: AssetDetailGridItemProps) {
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
