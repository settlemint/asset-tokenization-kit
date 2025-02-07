import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { getMyAsset } from "./_components/data";

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
      title: "Asset not found",
    };
  }

  return {
    title: myAsset.asset.name,
    openGraph: {
      images: [
        {
          url: `/share/${mapAssetType(myAsset.asset.type)}/${id}/og`,
          width: 1280,
          height: 640,
          alt: myAsset.asset.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/${mapAssetType(myAsset.asset.type)}/${id}/og`,
          width: 1280,
          height: 640,
          alt: myAsset.asset.name,
        },
      ],
    },
  };
}

function mapAssetType(assetType: string) {
  switch (assetType.toLowerCase()) {
    case "bond":
      return "bonds";
    case "stablecoin":
      return "stablecoins";
    case "equity":
      return "equities";
    case "cryptocurrency":
      return "cryptocurrencies";
    case "fund":
      return "funds";
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
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
