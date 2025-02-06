import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { getMyAsset } from '../data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const myAsset = await getMyAsset(id);

  if (!myAsset) {
    return {
      title: 'Asset not found',
    };
  }

  // TODO: map asset type to share url
  return {
    title: myAsset.asset.name,
    openGraph: {
      images: [
        {
          url: `/share/${myAsset.asset.type}/${id}/og`,
          width: 1280,
          height: 640,
          alt: myAsset.asset.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/${myAsset.asset.type}/${id}/og`,
          width: 1280,
          height: 640,
          alt: myAsset.asset.name,
        },
      ],
    },
  };
}

export default async function MyAssetDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const myAsset = await getMyAsset(id);

  return (
    <div>
      <h1 className="flex items-center font-bold text-2xl">
        <span className="mr-2">{myAsset?.asset.name}</span>
        <span className="text-muted-foreground">({myAsset?.asset.symbol})</span>
      </h1>
      <div className="relative mt-4 space-y-2">{children}</div>
    </div>
  );
}
