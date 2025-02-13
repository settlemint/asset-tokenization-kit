import { Badge } from '@/components/ui/badge';
import { PauseCircle, PlayCircle } from 'lucide-react';
import type { ReactElement } from 'react';

export function ActivePill({ paused }: { paused: boolean }): ReactElement {
  return (
    <Badge variant={paused ? 'destructive' : 'success'}>
      {paused ? (
        <>
          <PauseCircle className="mr-1 h-3 w-3" />
          <span>Paused</span>
        </>
      ) : (
        <>
          <PlayCircle className="mr-1 h-3 w-3" />
          <span>Active</span>
        </>
      )}
    </Badge>
  );
}
