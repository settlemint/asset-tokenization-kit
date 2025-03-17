import { formatNumber } from '@/lib/utils/number';

export function MyAssetsCount({ total }: { total: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="mr-1 font-bold text-4xl">{formatNumber(total)}</span>
        <span>assets</span>
      </div>
    </div>
  );
}
