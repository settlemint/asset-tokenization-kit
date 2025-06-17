import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { getUser } from "@/lib/auth/utils";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface DetailsProps {
  address: Address;
}

export async function YieldDetails({ address }: DetailsProps) {
  const user = await getUser();
  // Hardcoded to bond because the other asset types don't have yield
  const bond = await getBondDetail({ address, userCurrency: user.currency });
  // const yieldSchedule = bond.yieldSchedule!;

  const t = await getTranslations("admin.bonds.yield");
  const locale = await getLocale();

  // const ratePercentage = Number(yieldSchedule.rate) / 100;
  // const periodCount = yieldSchedule.periods.length;

  // const intervalPeriod = secondsToInterval(yieldSchedule.interval.toString());
  // Use the translation from the interval options section
  // The translation keys are in admin.bonds.yield.set-schedule.interval.options.[period]
  // const intervalDisplay = intervalPeriod
  //   ? t(`set-schedule.interval.options.${intervalPeriod}`)
  //   : `${intervalPeriod} ${t("set-schedule.interval.options.seconds")}`;
  //NOTE: HARDCODED SO IT STILL COMPILES
  const totalYield = 0;
  // const totalYield = yieldSchedule.periods.reduce(
  //   (acc, period) => acc + Number(period.totalYield),
  //   0
  // );
  // const totalUnclaimedYield = totalYield - Number(yieldSchedule.totalClaimed);
  return (
    <DetailGrid>
      {/* <DetailGridItem label={t("type")}>{t("type-fixed")}</DetailGridItem>
      <DetailGridItem label={t("contract-address")}>
        <EvmAddress
          address={yieldSchedule.id}
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
          locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("start-date")}>
        {formatDate(new Date(Number(yieldSchedule.startDate) * 1000), {
          locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("end-date")}>
        {formatDate(new Date(Number(yieldSchedule.endDate) * 1000), { locale })}
      </DetailGridItem>
      <DetailGridItem label={t("interval")}>{intervalDisplay}</DetailGridItem>
      <DetailGridItem label={t("periods")}>{periodCount}</DetailGridItem>
      <DetailGridItem label={t("total-yield-distributed")}>
        {formatNumber(yieldSchedule.totalClaimed, {
          token: yieldSchedule.underlyingAsset.symbol,
          decimals: yieldSchedule.underlyingAsset.decimals,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("total-unclaimed-yield")}>
        {formatNumber(totalUnclaimedYield, {
          token: yieldSchedule.underlyingAsset.symbol,
          decimals: yieldSchedule.underlyingAsset.decimals,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("underlying-asset-balance")}>
        {formatNumber(yieldSchedule.underlyingBalance, {
          token: yieldSchedule.underlyingAsset.symbol,
          decimals: yieldSchedule.underlyingAsset.decimals,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem
        label={t("yield-coverage")}
        info={t("yield-coverage-info")}
      > */}
      {/*
            Yield coverage shows what percentage of unclaimed yield obligations can be covered
            by the available underlying asset balance. If there's no unclaimed yield (equals 0),
            we display "N/A" as there's nothing to cover rather than showing 100% which could be misleading.
          */}
      {/* {Number(totalYield) === 0
          ? "N/A"
          : Number(yieldSchedule.underlyingBalance) >
              Number(totalUnclaimedYield)
            ? "100%"
            : formatNumber(
                (Number(yieldSchedule.underlyingBalance) /
                  Number(totalUnclaimedYield)) *
                  100,
                {
                  percentage: true,
                  decimals: 0,
                  locale,
                }
              )}
      </DetailGridItem> */}
    </DetailGrid>
  );
}
