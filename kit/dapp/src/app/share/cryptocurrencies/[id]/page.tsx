import { getOgCryptoCurrency } from "@/app/share/cryptocurrencies/[id]/_components/data";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const cryptoCurrency = await getOgCryptoCurrency(id);

  if (!cryptoCurrency) {
    return {
      title: "Asset Not Found",
      description: "The requested asset could not be found.",
    };
  }

  return {
    title: cryptoCurrency?.name,
    openGraph: {
      images: [
        {
          url: new URL(`/share/cryptocurrencies/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: cryptoCurrency?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: new URL(`/share/cryptocurrencies/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: cryptoCurrency?.name,
        },
      ],
    },
  };
}

export default function CryptoCurrencySharePage() {
  return null;
}
