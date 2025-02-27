import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CopyToClipboard } from '@/components/ui/copy';
import { formatDate } from '@/lib/utils/date';
import { shortHex } from '@/lib/utils/hex';
import { formatNumber } from '@/lib/utils/number';
import { Ban, Check } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getUser } from './data';

type DetailsGridProps = {
  id: string;
};

export async function DetailsGrid({ id }: DetailsGridProps) {
  const user = await getUser(id);

  return (
    <Card className="py-4">
      <CardContent className="grid grid-cols-3 gap-x-4 gap-y-8">
        <DetailsGridItem label="Name">{user.name}</DetailsGridItem>
        <DetailsGridItem label="Email">{user.email}</DetailsGridItem>
        <DetailsGridItem label="Status">
          <Badge variant={user.banned ? 'destructive' : 'success'}>
            {user.banned ? (
              <>
                <Ban className="mr-1 h-3 w-3" />
                <span>Banned</span>
              </>
            ) : (
              <>
                <Check className="mr-1 h-3 w-3" />
                <span>Active</span>
              </>
            )}
          </Badge>
        </DetailsGridItem>
        <DetailsGridItem label="Created at">
          {formatDate(user.created_at as string, { type: 'distance' })}
        </DetailsGridItem>
        <DetailsGridItem label="Verified at">
          {user.kyc_verified
            ? formatDate(user.kyc_verified as string, { type: 'distance' })
            : 'Not Verified'}
        </DetailsGridItem>
        <DetailsGridItem label="Wallet">
          <div className="flex items-center gap-2 text-md">
            <AddressAvatar address={user.wallet as Address} size="small" />
            <CopyToClipboard
              value={user.wallet}
              displayText={
                shortHex(user.wallet, { prefixLength: 12, suffixLength: 8 }) ??
                ''
              }
            />
          </div>
        </DetailsGridItem>
        <DetailsGridItem label="Asset supply">
          {formatNumber(user.assetCount, { decimals: 0 })}
        </DetailsGridItem>
        <DetailsGridItem label="Transactions">
          {formatNumber(user.transactionCount, { decimals: 0 })}
        </DetailsGridItem>
        <DetailsGridItem label="Last activity">
          {user.lastActivity
            ? formatDate(user.lastActivity, { type: 'distance' })
            : 'Never'}
        </DetailsGridItem>
        <DetailsGridItem label="Last login">
          {user.last_login
            ? formatDate(user.last_login as string, { type: 'distance' })
            : 'Never'}
        </DetailsGridItem>
      </CardContent>
    </Card>
  );
}

interface DetailsGridItemProps extends PropsWithChildren {
  label: string;
}

export function DetailsGridItem({ label, children }: DetailsGridItemProps) {
  return (
    <div className="space-y-1">
      <span className="font-medium text-muted-foreground text-sm">{label}</span>
      <div className="text-md">{children}</div>
    </div>
  );
}
