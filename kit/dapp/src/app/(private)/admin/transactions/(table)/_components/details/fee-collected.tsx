import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatNumber } from '@/lib/number';
import type { ManagementFeeCollectedEvent, PerformanceFeeCollectedEvent } from '../data';

interface FeeCollectedDetailsProps {
  details: ManagementFeeCollectedEvent | PerformanceFeeCollectedEvent;
}

export function FeeCollectedDetails({ details }: FeeCollectedDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">Amount:</dt>
          <dd className="text-sm">{formatNumber(details.amount)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
