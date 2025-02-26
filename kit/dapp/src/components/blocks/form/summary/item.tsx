import type { ReactNode } from 'react';

interface FormSummaryDetailItemProps {
  label: ReactNode;
  value: ReactNode;
}

export function FormSummaryDetailItem({
  label,
  value,
}: FormSummaryDetailItemProps) {
  return (
    <div className="flex justify-between py-1.5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-medium text-sm">{value}</dd>
    </div>
  );
}
