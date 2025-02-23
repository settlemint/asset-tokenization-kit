import { getOgBond } from '@/app/share/bonds/[id]/_components/data';
import { metadata } from '@/lib/config/metadata';
import type { Metadata } from 'next';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const bond = await getOgBond(id);

  if (!bond) {
    return {
      title: 'Asset Not Found',
      description: 'The requested asset could not be found.',
    };
  }

  return {
    title: bond?.name,
    openGraph: {
      images: [
        {
          url: new URL(
            `/share/bonds/${id}/og`,
            metadata.metadataBase
          ).toString(),
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: new URL(
            `/share/bonds/${id}/og`,
            metadata.metadataBase
          ).toString(),
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
  };
}

export default function BondSharePage() {
  return null;
}
