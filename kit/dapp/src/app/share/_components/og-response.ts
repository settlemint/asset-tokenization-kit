import { ImageResponse } from 'next/og';
import type { ReactElement } from 'react';

const IMAGE_DIMENSIONS = { height: 630, width: 1200 };
const CACHE_HEADER =
  'public, max-age=3600, s-maxage=3600, stale-while-revalidate=60';

export function createOgResponse(component: ReactElement): Response {
  const imageResponse = new ImageResponse(component, IMAGE_DIMENSIONS);
  const headers = new Headers(imageResponse.headers);
  headers.set('Cache-Control', CACHE_HEADER);
  return new Response(imageResponse.body, {
    headers,
    status: imageResponse.status,
    statusText: imageResponse.statusText,
  });
}
