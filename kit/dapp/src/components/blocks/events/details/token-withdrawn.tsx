import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { formatNumber } from '@/lib/number';
import type { TokenWithdrawnEvent } from '../../../../app/(private)/admin/transactions/(table)/_components/data';

interface TokenWithdrawnDetailsProps {
  details: TokenWithdrawnEvent;
}

export function TokenWithdrawnDetails({ details }: TokenWithdrawnDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">To:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.to.id}>
              <EvmAddressBalances address={details.to.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Token:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.token.id}>
              <EvmAddressBalances address={details.token.id} />
            </EvmAddress>{' '}
            ({details.token.symbol})
          </dd>
          <dt className="text-muted-foreground text-sm">Amount:</dt>
          <dd className="text-sm">{formatNumber(details.amount)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
