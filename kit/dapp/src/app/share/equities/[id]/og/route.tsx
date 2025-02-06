import { OgDataBox } from '@/app/share/_components/og-data-box';
import { OgImage } from '@/app/share/_components/og-image';
import { OgNotFound } from '@/app/share/_components/og-not-found';
import { createOgResponse } from '@/app/share/_components/og-response';
import { formatTokenValue } from '@/lib/number';
import type { Address } from 'viem';
import { getOgEquity } from '../_components/data';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const url = new URL(request.url);

  // Get fund address from params
  const { id } = await params;
  const equity = await getOgEquity(id);

  if (!equity) {
    return createOgResponse(<OgNotFound />);
  }

  return createOgResponse(
    <OgImage
      id={id as Address}
      name={equity.name}
      symbol={equity.symbol}
      totalSupply={equity.totalSupply}
      baseUrl={url.origin}
    >
      <OgDataBox label="Total Supply" value={formatTokenValue(BigInt(equity.totalSupply), { decimals: 2 })} />
      <OgDataBox label="Class" value={equity.equityClass} />
      <OgDataBox label="Category" value={equity.equityCategory} />
    </OgImage>
  );
}
