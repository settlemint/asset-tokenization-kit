import { OgDataBox } from '@/app/share/_components/og-data-box';
import { OgImage } from '@/app/share/_components/og-image';
import { OgNotFound } from '@/app/share/_components/og-not-found';
import { formatTokenValue } from '@/lib/number';
import {} from '@/lib/settlemint/the-graph';
import { ImageResponse } from 'next/og';
import type { Address } from 'viem';
import { getOgBond } from '../_components/data';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const url = new URL(request.url);

  // Get fund address from params
  const { id } = await params;
  const bond = await getOgBond(id);

  if (!bond) {
    return new ImageResponse(<OgNotFound />, {
      height: 640,
      width: 1280,
    });
  }

  const imageResponse = new ImageResponse(
    <OgImage
      id={id as Address}
      name={bond.name}
      symbol={bond.symbol}
      totalSupply={bond.totalSupply}
      baseUrl={url.origin}
    >
      <OgDataBox label="Maturity Date" value={bond.maturityDate} />
      <OgDataBox label="Face Value" value={formatTokenValue(BigInt(bond.faceValue), { decimals: 2 })} />
    </OgImage>,
    {
      height: 640,
      width: 1280,
    }
  );

  // Add caching headers for 1 hour
  const headers = new Headers(imageResponse.headers);
  headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=60');

  return new Response(imageResponse.body, {
    headers,
    status: imageResponse.status,
    statusText: imageResponse.statusText,
  });
}
