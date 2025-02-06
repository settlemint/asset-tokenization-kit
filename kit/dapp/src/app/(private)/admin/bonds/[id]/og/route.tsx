import EmptyOGImage from '@/lib/config/metadata/empty-og.png' assert { type: 'image' };
import { formatTokenValue } from '@/lib/number';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { ImageResponse } from 'next/og';
import { getGravatarUrl } from 'react-awesome-gravatar';
import { getAddress } from 'viem';

// Remove edge runtime as we're running in Node.js
// export const runtime = 'edge';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const OgBond = theGraphGraphqlStarterkits(`
  query OgBond($id: ID!) {
    bond(id: $id) {
      name
      symbol
      totalSupply
      maturityDate
      faceValue
    }
  }
`);

export async function GET(request: Request, { params }: RouteParams) {
  const url = new URL(request.url);

  // Get fund address from params
  const { id: fundAddress } = await params;
  const { bond } = await theGraphClientStarterkits.request(OgBond, {
    id: fundAddress,
  });

  const avatarUrl = getGravatarUrl(getAddress(fundAddress), {
    default: 'identicon',
    size: 400,
  });

  if (!bond) {
    return new ImageResponse(
      <div tw="flex flex-col w-full h-full justify-center text-slate-900" style={{ display: 'flex' }}>
        <div tw="text-3xl text-slate-500">Asset not found</div>
      </div>
    );
  }
  // Construct absolute URL for the background image
  const imageUrl = new URL(EmptyOGImage.src, url.origin).toString();

  const imageResponse = new ImageResponse(
    <div tw="flex flex-col w-full h-full">
      {/* biome-ignore lint/nursery/noImgElement: <explanation> */}
      <img src={imageUrl} alt="Background" tw="absolute top-0 left-0 w-full h-full object-cover" />
      <div tw="flex flex-col absolute top-48 left-32 text-white">
        <p tw="text-7xl font-bold mb-4">
          {bond.name} ({bond.symbol})
        </p>
        <p tw="text-xl mt-0 flex items-center">
          {/* biome-ignore lint/nursery/noImgElement: <explanation> */}
          <img src={avatarUrl} alt={bond.name} tw="w-8 h-8 rounded-full mr-2" />
          {getAddress(fundAddress)}
        </p>

        <div tw="flex gap-24 mt-16 pr-32">
          <div tw="flex flex-col p-8 rounded-2xl border-4 border-white/30 bg-white/5">
            <dt tw="text-2xl text-slate-300">Total Supply</dt>
            <dd tw="text-4xl font-bold text-white mt-2">
              {formatTokenValue(BigInt(bond.totalSupply), { decimals: 2 })}
            </dd>
          </div>
          <div tw="flex flex-col p-8 rounded-2xl border-4 border-white/30 bg-white/5 ml-4">
            <dt tw="text-2xl text-slate-300">Maturity Date</dt>
            <dd tw="text-4xl font-bold text-white mt-2 capitalize">{bond.maturityDate}</dd>
          </div>
          <div tw="flex flex-col p-8 rounded-2xl border-4 border-white/30 bg-white/5 ml-4">
            <dt tw="text-2xl text-slate-300">Face Value</dt>
            <dd tw="text-4xl font-bold text-white mt-2 capitalize">
              {formatTokenValue(BigInt(bond.faceValue), { decimals: 2 })}
            </dd>
          </div>
        </div>
      </div>
    </div>,
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
