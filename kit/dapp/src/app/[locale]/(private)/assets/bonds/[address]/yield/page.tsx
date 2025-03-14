import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { Details } from "./_components/details";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { address, locale } = await params;
  const bond = await getBondDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.bonds.yield",
  });

  return {
    title: t("yield-page-title", {
      name: bond?.name,
    }),
    description: t("yield-page-description", {
      name: bond?.name,
    }),
  };
}

export default async function BondDetailPage({ params }: PageProps) {
  const { address, locale } = await params;
  const bond = await getBondDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: "admin.bonds",
  });

  return (
    <>
      <Details address={address} />
    </>
  );
}
