import { getOgBond } from '@/app/share/bonds/[id]/_components/data';
import type { Metadata } from 'next';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
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
          url: `/share/bonds/${id}/og`,
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/bonds/${id}/og`,
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
