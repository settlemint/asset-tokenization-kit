import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PropsWithChildren } from 'react';

interface DetailGridItemProps extends PropsWithChildren {
  label: string;
  info?: string;
}

export function DetailGridItem({ label, children, info }: DetailGridItemProps) {
  const t = useTranslations('components.detail-grid');

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground text-sm">
          {label}
        </span>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="size-4 text-muted-foreground"
                  aria-label={t('info-icon-label')}
                />
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
