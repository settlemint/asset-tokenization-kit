import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ComponentType } from 'react';
export function AssetDetailsGrid<Asset>({
  data,
  icons,
  name,
  cells,
}: {
  data: Asset;
  icons: Record<string, ComponentType<{ className?: string }>>;
  name: string;
  cells: unknown;
}) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className=" space-y-2">
        <div className="space-y-1">Details</div>
      </CardContent>
    </Card>
  );
}
