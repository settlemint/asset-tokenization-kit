import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { formatNumber } from '@/lib/number';
import type { BondRedeemedEvent } from '../fragments';

interface BondRedeemedDetailsProps {
  details: BondRedeemedEvent;
}

export function BondRedeemedDetails({ details }: BondRedeemedDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">Holder:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.holder.id}>
              <EvmAddressBalances address={details.holder.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Bond Amount:</dt>
          <dd className="text-sm">{formatNumber(details.bondAmount)}</dd>
          <dt className="text-muted-foreground text-sm">Underlying Amount:</dt>
          <dd className="text-sm">{formatNumber(details.underlyingAmount)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
