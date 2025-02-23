import { getOgFund } from '@/app/share/funds/[id]/_components/data';
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
  const fund = await getOgFund(id);

  if (!fund) {
    return {
      title: 'Asset Not Found',
      description: 'The requested asset could not be found.',
    };
  }

  return {
    title: fund?.name,
    openGraph: {
      images: [
        {
          url: new URL(
            `/share/funds/${id}/og`,
            metadata.metadataBase
          ).toString(),
          width: 1280,
          height: 640,
          alt: fund?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: new URL(
            `/share/funds/${id}/og`,
            metadata.metadataBase
          ).toString(),
          width: 1280,
          height: 640,
          alt: fund?.name,
        },
      ],
    },
  };
}

export default function FundSharePage() {
  return null;
}
