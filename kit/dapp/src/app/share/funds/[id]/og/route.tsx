import { OgDataBox } from '@/app/share/_components/og-data-box';
import { OgImage } from '@/app/share/_components/og-image';
import { OgNotFound } from '@/app/share/_components/og-not-found';
import { createOgResponse } from '@/app/share/_components/og-response';
import {} from '@/lib/settlemint/the-graph';
import type { Address } from 'viem';
import { getOgFund } from '../_components/data';

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
  const fund = await getOgFund(id);

  if (!fund) {
    return createOgResponse(<OgNotFound />);
  }

  return createOgResponse(
    <OgImage
      id={id as Address}
      name={fund.name}
      symbol={fund.symbol}
      totalSupply={fund.totalSupply}
      baseUrl={url.origin}
    >
      <OgDataBox label="Class" value={fund.fundClass} />
      <OgDataBox label="Category" value={fund.fundCategory} />
    </OgImage>
  );
}
