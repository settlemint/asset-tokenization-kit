import { Card, CardContent } from '@/components/ui/card';
import type { ComponentType } from 'react';
import type { StableCoinAsset } from '../../../../_components/data';

export function AssetHoldersTable<Asset extends StableCoinAsset>({
  data,
}: {
  data: Asset;
  icons: Record<string, ComponentType<{ className?: string }>>;
  name: string;
  cells: unknown;
}) {
  return (
    <Card className="py-4">
      <CardContent className="grid grid-cols-6 gap-x-4 gap-y-8">
        <h1>AssetHolderTable</h1>
      </CardContent>
    </Card>
  );
}
