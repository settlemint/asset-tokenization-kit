import { getOgStablecoin } from '@/app/share/stablecoins/[id]/_components/data';
import type { Metadata } from 'next';

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
      title: 'Asset Not Found',
      description: 'The requested asset could not be found.',
    };
  }

  return {
    title: stableCoin?.name,
    openGraph: {
      images: [
        {
          url: `/share/stablecoins/${id}/og`,
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/stablecoins/${id}/og`,
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
