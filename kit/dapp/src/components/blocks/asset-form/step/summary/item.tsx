import type { ReactNode } from 'react';

interface AssetFormSummaryDetailItemProps {
  label: ReactNode;
  value: ReactNode;
}

export function AssetFormSummaryDetailItem({ label, value }: AssetFormSummaryDetailItemProps) {
  return (
    <div className="flex justify-between py-1.5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-medium text-sm">{value}</dd>
    </div>
  );
}
