import { OgImage } from '@/app/share/_components/og-image';
import { OgNotFound } from '@/app/share/_components/og-not-found';
import { createOgResponse } from '@/app/share/_components/og-response';
import {} from '@/lib/settlemint/the-graph';
import type { Address } from 'viem';
import { getOgCryptoCurrency } from '../_components/data';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const url = new URL(request.url);

  // Get fund address from params
  const { id } = await params;
  const cryptoCurrency = await getOgCryptoCurrency(id);

  if (!cryptoCurrency) {
    return createOgResponse(<OgNotFound />);
  }

  return createOgResponse(
    <OgImage
      id={id as Address}
      name={cryptoCurrency.name}
      symbol={cryptoCurrency.symbol}
      totalSupply={cryptoCurrency.totalSupply}
      baseUrl={url.origin}
    />
  );
}
