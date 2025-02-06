import EmptyOGImage from '@/lib/config/metadata/empty-og.png';
import { formatTokenValue } from '@/lib/number';
import type { PropsWithChildren } from 'react';
import { getGravatarUrl } from 'react-awesome-gravatar';
import { type Address, getAddress } from 'viem';
import { OgDataBox } from './og-data-box';

interface OgImageProps {
  id: Address;
  baseUrl: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

export function OgImage({ id, name, symbol, totalSupply, baseUrl, children }: PropsWithChildren<OgImageProps>) {
  const avatarUrl = getGravatarUrl(getAddress(id), {
    default: 'identicon',
    size: 400,
  });
  const imageUrl = new URL(EmptyOGImage.src, baseUrl).toString();

  return (
    <div tw="flex flex-col w-full h-full">
      {/* biome-ignore lint/nursery/noImgElement: <explanation> */}
      <img src={imageUrl} alt="Background" tw="absolute top-0 left-0 w-full h-full object-cover" />
      <div tw="flex flex-col absolute top-48 left-32 text-white">
        <p tw="text-7xl font-bold mb-4">
          {name} ({symbol})
        </p>
        <p tw="text-xl mt-0 flex items-center">
          {/* biome-ignore lint/nursery/noImgElement: <explanation> */}
          <img src={avatarUrl} alt={name} tw="w-8 h-8 rounded-full mr-2" />
          {getAddress(id)}
        </p>

        <div tw="flex gap-24 mt-16 pr-32">
          <OgDataBox label="Total Supply" value={formatTokenValue(BigInt(totalSupply), { decimals: 2 })} />
          {children}
        </div>
      </div>
    </div>
  );
}
