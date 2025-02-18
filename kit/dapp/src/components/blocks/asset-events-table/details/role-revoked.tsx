import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { roles } from '@/lib/roles';
import type { RoleRevokedEvent } from '../asset-events-fragments';

interface RoleRevokedDetailsProps {
  details: RoleRevokedEvent;
}

export function RoleRevokedDetails({ details }: RoleRevokedDetailsProps) {
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
