import { hasMica } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/features-enabled";
import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { RegulationPill } from "@/components/blocks/regulation-pill/regulation-pill";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { regulations } from "@/lib/config/regulations";
import {
  RegulationStatus,
  type RegulationType,
} from "@/lib/db/regulations/schema-base-regulation-configs";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getRegulationList } from "@/lib/queries/regulations/regulation-list";
import { normalizeAddress } from "@/lib/utils/address";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Address } from "viem";

interface DetailPageHeaderProps {
  address: Address;
  assettype: AssetType;
  manageDropdown: (params: {
    assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
    assetUsersDetails: Awaited<ReturnType<typeof getAssetUsersDetail>>;
    userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
    userUnderlyingAssetBalance: Awaited<
      ReturnType<typeof getAssetBalanceDetail>
    > | null;
    userAddress: Address;
  }) => ReactNode;
}

async function getRegulationPills(assetId: string) {
  const regulationConfigs = await getRegulationList({
    assetId: normalizeAddress(assetId as Address),
  });

  return regulationConfigs
    .filter((config) => config.status === RegulationStatus.COMPLIANT)
    .map((config) => {
      const regulationInfo = regulations.find(
        (r) => r.id === config.regulation_type
      );
      if (!regulationInfo) return null;

      return {
        type: config.regulation_type as RegulationType,
        documentationUrl: regulationInfo.documentationUrl,
      };
    })
    .filter((pill): pill is NonNullable<typeof pill> => pill !== null);
}

export async function DetailPageHeader({
  address,
  assettype,
  manageDropdown,
}: DetailPageHeaderProps) {
  const user = await getUser();
  const [assetDetails, t, userBalance, assetUsersDetails] = await Promise.all([
    getAssetDetail({ address, assettype }),
    getTranslations("private.assets.details"),
    getAssetBalanceDetail({
      address,
      account: user.wallet,
    }),
    getAssetUsersDetail({ address }),
  ]);

  const userUnderlyingAssetBalance =
    assettype === "bond"
      ? await getAssetBalanceDetail({
          address: (assetDetails as Awaited<ReturnType<typeof getBondDetail>>)
            .underlyingAsset.id,
          account: user.wallet,
        })
      : null;

  const isMicaEnabled = await hasMica(assettype, address);
  const regulationPills = isMicaEnabled
    ? await getRegulationPills(address)
    : [];

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{assetDetails.name}</span>
          <span className="text-muted-foreground">({assetDetails.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t("asset-management")}
      pill={
        <div className="flex gap-2">
          <ActivePill
            paused={"paused" in assetDetails ? assetDetails.paused : false}
          />
          {regulationPills.map((regulation) => {
            return <RegulationPill key={regulation.type} {...regulation} />;
          })}
        </div>
      }
      button={manageDropdown({
        assetDetails,
        userBalance,
        assetUsersDetails,
        userAddress: user.wallet,
        userUnderlyingAssetBalance,
      })}
    />
  );
}
