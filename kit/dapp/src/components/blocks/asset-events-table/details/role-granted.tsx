import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { RoleGrantedEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { roles } from '@/lib/roles';

interface RoleGrantedDetailsProps {
  details: RoleGrantedEvent;
}

export function RoleGrantedDetails({ details }: RoleGrantedDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">Account:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.account.id}>
              <EvmAddressBalances address={details.account.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Role:</dt>
          <dd className="text-sm">{roles[details.role]}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
