import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { Card, CardContent } from '@/components/ui/card';
import { CopyToClipboard } from '@/components/ui/copy';
import { formatDate } from '@/lib/date';
import { shortHex } from '@/lib/hex';
import type { PropsWithChildren } from 'react';
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
        <DetailsGridItem label="Status">{user.banned ? 'Banned' : 'Active'}</DetailsGridItem>
        <DetailsGridItem label="Created At">{formatDate(user.created_at as string)}</DetailsGridItem>
        <DetailsGridItem label="Verified At">
          {user.kyc_verified ? formatDate(user.kyc_verified as string) : 'Not Verified'}
        </DetailsGridItem>
        <DetailsGridItem label="Wallet">
          <div className="flex items-center gap-2 text-md">
            <AddressAvatar address={user.wallet} variant="small" />
            <CopyToClipboard
              value={user.wallet}
              displayText={shortHex(user.wallet, { prefixLength: 12, suffixLength: 8 }) ?? ''}
              className="ml-2"
            />
          </div>
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
