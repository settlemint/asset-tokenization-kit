import { AirdropTabs } from "@/components/blocks/airdrop/airdrop-tabs";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getPushAirdropDetail } from "@/lib/queries/push-airdrop/push-airdrop-detail";
import { getStandardAirdropDetail } from "@/lib/queries/standard-airdrop/standard-airdrop-detail";
import { getVestingAirdropDetail } from "@/lib/queries/vesting-airdrop/vesting-airdrop-detail";
import { shortHex } from "@/lib/utils/hex";
import {
  type AirdropType,
  AirdropTypeEnum,
} from "@/lib/utils/typebox/airdrop-types";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { AirdropDetailPageHeader } from "./_components/airdrop-detail-page-header";
import { AirdropManageDropdown } from "./_components/manage-dropdown/manage-dropdown";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: Locale;
    address: Address;
    airdroptype: AirdropType;
  }>;
}

export default async function AirdropDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale, airdroptype } = await params;
  const user = await getUser();

  // Get the appropriate airdrop details based on type
  const airdrop = await (async () => {
    switch (airdroptype) {
      case AirdropTypeEnum.standard:
        return getStandardAirdropDetail({ address, user });
      case AirdropTypeEnum.vesting:
        return getVestingAirdropDetail({ address, user });
      case AirdropTypeEnum.push:
        return getPushAirdropDetail({ address, user });
      default:
        return null;
    }
  })();

  if (!airdrop) {
    return notFound();
  }

  return (
    <>
      <AirdropDetailPageHeader
        address={address}
        manageDropdown={() => <AirdropManageDropdown airdrop={airdrop} />}
      />
      <div className="relative mt-4 space-y-2">
        <AirdropTabs
          locale={locale}
          path={`distribution/airdrops/${airdroptype}/${address}`}
        />
      </div>
      {children}
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
