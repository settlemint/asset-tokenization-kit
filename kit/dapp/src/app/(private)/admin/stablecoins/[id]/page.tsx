import { redirect } from 'next/navigation';

export default async function StableCoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/admin/stablecoins/${id}/details`);
}
