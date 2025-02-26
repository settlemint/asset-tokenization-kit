import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ApprovalEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { formatNumber } from '@/lib/utils/number';

interface ApprovalDetailsProps {
  details: ApprovalEvent;
}

export function ApprovalDetails({ details }: ApprovalDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">Owner:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.owner.id}>
              <EvmAddressBalances address={details.owner.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Spender:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.spender.id}>
              <EvmAddressBalances address={details.spender.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Value:</dt>
          <dd className="text-sm">{formatNumber(details.value)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
