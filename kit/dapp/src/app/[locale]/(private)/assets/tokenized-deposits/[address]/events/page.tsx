import { AssetEventsTable } from "@/components/blocks/asset-events-table/asset-events-table";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { address, locale } = await params;
  const tokenizedDeposit = await getTokenizedDepositDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.tokenized-deposits.events",
  });

  return {
    title: t("events-page-title", {
      name: tokenizedDeposit?.name,
    }),
    description: t("events-page-description", {
      name: tokenizedDeposit?.name,
    }),
  };
}

export default async function TokenizedDepositEventsPage({
  params,
}: PageProps) {
  const { address } = await params;

  return <AssetEventsTable asset={address} />;
}
