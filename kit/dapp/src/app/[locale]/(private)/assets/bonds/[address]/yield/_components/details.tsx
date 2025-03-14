import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";
import { SetYieldScheduleForm } from "./set-yield-schedule-form/form";

interface DetailsProps {
  address: Address;
}

export async function Details({ address }: DetailsProps) {
  const bond = await getBondDetail({ address });
  const t = await getTranslations("admin.bonds.yield");

  if (!bond.yieldSchedule) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <h3 className="text-xl font-semibold">{t("no-yield.title")}</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {t("no-yield.description")}
        </p>
        <SetYieldScheduleForm address={address} asButton />
      </div>
    );
  }

  const yieldPerPeriod = bond.yieldSchedule.periods[0]?.totalClaimed ?? "0";
  const ratePercentage = Number(bond.yieldSchedule.rate) / 100;
  const periodCount = Math.floor(
    (Number(bond.yieldSchedule.endDate) - Number(bond.yieldSchedule.startDate)) /
      Number(bond.yieldSchedule.interval)
  );

  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t("type")}>
          {t("type-fixed")}
        </DetailGridItem>
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={address}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("creator")}>
          <EvmAddress
            address={bond.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("rate")}>
          {formatNumber(ratePercentage, {
            percentage: true,
            decimals: 0,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("start-date")}>
          {formatDate(new Date(Number(bond.yieldSchedule.startDate) * 1000))}
        </DetailGridItem>
        <DetailGridItem label={t("end-date")}>
          {formatDate(new Date(Number(bond.yieldSchedule.endDate) * 1000))}
        </DetailGridItem>
        <DetailGridItem label={t("interval")}>
          {t("yearly")}
        </DetailGridItem>
        <DetailGridItem label={t("periods")}>
          {periodCount}
        </DetailGridItem>
        <DetailGridItem label={t("yield-per-period")}>
          {yieldPerPeriod} USDC
        </DetailGridItem>
        <DetailGridItem label={t("total-yield-distributed")}>
          {bond.yieldSchedule.totalClaimed} USDC
        </DetailGridItem>
        <DetailGridItem label={t("total-unclaimed-yield")}>
          {bond.yieldSchedule.unclaimedYield} USDC
        </DetailGridItem>
        <DetailGridItem label={t("underlying-asset-balance")}>
          {bond.yieldSchedule.underlyingBalance} USDC
        </DetailGridItem>
        <DetailGridItem label={t("yield-coverage")}>
          {formatNumber(
            (Number(bond.yieldSchedule.underlyingBalance) /
              Number(bond.yieldSchedule.unclaimedYield)) *
              100,
            {
              percentage: true,
              decimals: 0,
            }
          )}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
