import { getOgEquity } from "@/app/share/equities/[id]/_components/data";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const equity = await getOgEquity(id);

  if (!equity) {
    return {
      title: "Asset Not Found",
      description: "The requested asset could not be found.",
    };
  }

  return {
    title: equity?.name,
    openGraph: {
      images: [
        {
          url: new URL(`/share/equities/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: equity?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: new URL(`/share/equities/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: equity?.name,
        },
      ],
    },
  };
}

export default function EquitySharePage() {
  return null;
}
