import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatNumber } from '@/lib/number';
import type { CollateralUpdatedEvent } from '../fragments';

interface CollateralUpdatedDetailsProps {
  details: CollateralUpdatedEvent;
}

export function CollateralUpdatedDetails({ details }: CollateralUpdatedDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">Old Amount:</dt>
          <dd className="text-sm">{formatNumber(details.oldAmount)}</dd>
          <dt className="text-muted-foreground text-sm">New Amount:</dt>
          <dd className="text-sm">{formatNumber(details.newAmount)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
