import { DataTable } from "@/components/blocks/data-table/data-table";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { columns } from "./_components/columns";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function AllowlistPage({ params }: PageProps) {
  const { address, assettype } = await params;
  const assetDetail = await getAssetUsersDetail({ address });
  const t = await getTranslations("private.assets.details.tabs");

  return (
    <DataTable
      columnParams={{
        address,
        assettype,
      }}
      columns={columns}
      data={[]} //assetDetail.allowlist
      name={t("allowlist")}
    />
  );
}
