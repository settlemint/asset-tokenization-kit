import { OgDataBox } from '@/app/share/_components/og-data-box';
import { OgImage } from '@/app/share/_components/og-image';
import { OgNotFound } from '@/app/share/_components/og-not-found';
import { createOgResponse } from '@/app/share/_components/og-response';
import { formatTokenValue } from '@/lib/number';
import {} from '@/lib/settlemint/the-graph';
import type { Address } from 'viem';
import { getOgStablecoin } from '../_components/data';

// Remove edge runtime as we're running in Node.js
// export const runtime = 'edge';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const url = new URL(request.url);

  // Get fund address from params
  const { id } = await params;
  const stableCoin = await getOgStablecoin(id);

  if (!stableCoin) {
    return createOgResponse(<OgNotFound />);
  }

  return createOgResponse(
    <OgImage
      id={id as Address}
      name={stableCoin.name}
      symbol={stableCoin.symbol}
      totalSupply={stableCoin.totalSupply}
      baseUrl={url.origin}
    >
      <OgDataBox
        label="Collateral"
        value={formatTokenValue(Number.parseFloat(stableCoin.collateral), { decimals: 2 })}
      />
    </OgImage>
  );
}
