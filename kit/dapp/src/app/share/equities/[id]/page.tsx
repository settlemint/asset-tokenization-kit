import { getOgEquity } from '@/app/share/equities/[id]/_components/data';
import type { Metadata } from 'next';

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
      title: 'Asset Not Found',
      description: 'The requested asset could not be found.',
    };
  }

  return {
    title: equity?.name,
    openGraph: {
      images: [
        {
          url: `/share/equities/${id}/og`,
          width: 1280,
          height: 640,
          alt: equity?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/equities/${id}/og`,
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
