import { OgDataBox } from '@/app/share/_components/og-data-box';
import { OgImage } from '@/app/share/_components/og-image';
import { OgNotFound } from '@/app/share/_components/og-not-found';
import { ImageResponse } from 'next/og';
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
    return new ImageResponse(<OgNotFound />, {
      height: 640,
      width: 1280,
    });
  }

  const imageResponse = new ImageResponse(
    <OgImage
      id={id as Address}
      name={equity.name}
      symbol={equity.symbol}
      totalSupply={equity.totalSupply}
      baseUrl={url.origin}
    >
      <OgDataBox label="Class" value={equity.equityClass} />
      <OgDataBox label="Category" value={equity.equityCategory} />
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
