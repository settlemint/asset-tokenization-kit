import { Card, CardContent } from '@/components/ui/card';
import type { PropsWithChildren } from 'react';
import { getFund } from './data';

type DetailsGridProps = {
  id: string;
};

export async function DetailsGrid({ id }: DetailsGridProps) {
  const asset = await getFund(id);

  return (
    <Card className="py-4">
      <CardContent className="grid grid-cols-3 gap-x-4 gap-y-8">
        <DetailsGridItem label="Name">{asset.name}</DetailsGridItem>
        <DetailsGridItem label="Symbol">{asset.symbol}</DetailsGridItem>
        <DetailsGridItem label="Decimals">{asset.decimals}</DetailsGridItem>
        <DetailsGridItem label="Total supply">{asset.totalSupply}</DetailsGridItem>
        <DetailsGridItem label="Fund category">{asset.fundCategory}</DetailsGridItem>
        <DetailsGridItem label="Fund class">{asset.fundClass}</DetailsGridItem>
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
