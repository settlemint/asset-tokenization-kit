import { type FormatDateOptions, formatDate } from '@/lib/date';
import { type FormatNumberOptions, formatNumber } from '@/lib/number';
import type { ReactNode } from 'react';

type AssetPropertyValue = string | number | boolean | Date | undefined | null;
interface AssetPropertyProps {
  label: string;
  value: AssetPropertyValue;
  type?: 'number';
  options?: {
    number?: FormatNumberOptions;
    date?: FormatDateOptions;
  };
}

export function AssetProperty({ label, value, type, options }: AssetPropertyProps) {
  const formatValue = (val: AssetPropertyValue): ReactNode => {
    if (val === undefined || val === null || val === '') {
      return '-';
    }

    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }

    if (val instanceof Date) {
      return formatDate(val, options?.date);
    }

    if (type === 'number' || typeof val === 'number') {
      return formatNumber(val, options?.number);
    }

    return val;
  };

  return (
    <div className="flex justify-between py-1.5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-medium text-sm">{formatValue(value)}</dd>
    </div>
  );
}
