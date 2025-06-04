import { AirdropDetailPageHeader } from "@/app/[locale]/(private)/distribution/airdrops/[airdroptype]/[address]/_components/airdrop-detail-page-header";
import { metadata } from "@/lib/config/metadata";
import { shortHex } from "@/lib/utils/hex";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { MyAirdropManageDropdown } from "./_components/manage-dropdown/my-airdrop-manage-dropdown";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: Locale;
    address: Address;
    airdroptype: AirdropType;
  }>;
}

export default async function MyAirdropDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address } = await params;

  return (
    <>
      <AirdropDetailPageHeader
        address={address}
        manageDropdown={() => <MyAirdropManageDropdown address={address} />}
      />
      <div className="relative mt-4 space-y-2">{children}</div>
    </>
  );
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { address, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "private.airdrops.details",
  });

  const shortAddress = shortHex(address)!;
  return {
    title: {
      ...metadata.title,
      default: t("page-title", {
        address: shortAddress,
      }),
    },
    description: t("page-description", {
      address: shortAddress,
    }),
  };
}
