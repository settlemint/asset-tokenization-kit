import UserAssetsTable from "@/components/blocks/user-assets-table/user-assets-table";
import { getUserDetail } from "@/lib/queries/user/user-detail";

interface UserHoldingsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function UserHoldingsPage({
  params,
}: UserHoldingsPageProps) {
  const { id } = await params;
  const user = await getUserDetail({ id });

  return <UserAssetsTable wallet={user.wallet} />;
}
