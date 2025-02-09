import { getOgStablecoin } from "@/app/share/stablecoins/[id]/_components/data";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const stableCoin = await getOgStablecoin(id);

  if (!stableCoin) {
    return {
      title: "Asset Not Found",
      description: "The requested asset could not be found.",
    };
  }

  return {
    title: stableCoin?.name,
    openGraph: {
      images: [
        {
          url: new URL(`/share/stablecoins/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: new URL(`/share/stablecoins/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
  };
}

export default function StablecoinSharePage() {
  return null;
}
