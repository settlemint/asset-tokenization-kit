import { type FormatDateOptions, formatDate } from '@/lib/date';
import { type FormatNumberOptions, formatNumber } from '@/lib/number';
import type { ReactNode } from 'react';

interface AssetPropertyProps {
  label: string;
  value: string | number | boolean | Date | undefined | null;
  /**
   * Optional token symbol for formatting numbers
   */
  options?: {
    number?: FormatNumberOptions;
    date?: FormatDateOptions;
  };
  /**
   * Optional format function for custom value formatting
   */
  format?: (value: NonNullable<AssetPropertyProps['value']>) => ReactNode;
}

export function AssetProperty({ label, value, options, format }: AssetPropertyProps) {
  const formatValue = (val: AssetPropertyProps['value']): ReactNode => {
    if (val === undefined || val === null || val === '') {
      return '-';
    }

    if (format) {
      return format(val);
    }

    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }

    if (typeof val === 'number') {
      return formatNumber(val, options?.number);
    }

    if (val instanceof Date) {
      return formatDate(val, options?.date);
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
