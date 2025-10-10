import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { useDenominationAsset } from "@/hooks/use-denomination-asset";
import { parseClaim } from "@/lib/utils/claims/parse-claim";
import { orpc } from "@/orpc/orpc-client";
import { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useQuery } from "@tanstack/react-query";
import { from, greaterThan, multiply, sub } from "dnum";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
export function BondExtensionDetails({
  asset,
  bond,
}: {
  asset: Token;
  bond: NonNullable<Token["bond"]>;
}) {
  const { t } = useTranslation([
    "tokens",
    "assets",
    "common",
    "stats",
    "data-table",
  ]);
  const denominationAssetData = useDenominationAsset(
    bond.denominationAsset.id,
    asset
  );

  const denominationBasePriceClaim = parseClaim<{
    amount: string;
    currencyCode: string;
    decimals: string;
  }>(denominationAssetData.denominationAsset?.identity?.claims, "basePrice");

  const unitPrice = useMemo(() => {
    if (!denominationBasePriceClaim) return null;
    const denomBase = from([
      BigInt(denominationBasePriceClaim.amount),
      Number(denominationBasePriceClaim.decimals),
    ]);
    return multiply(denomBase, bond.faceValue);
  }, [denominationBasePriceClaim, bond.faceValue]);

  const { data: bondStatus } = useQuery(
    orpc.token.statsBondStatus.queryOptions({
      input: { tokenAddress: asset.id },
    })
  );

  const shortfall = useMemo(() => {
    const now = new Date();
    const maturityDate = new Date(bond.maturityDate);
    const hasReachedMaturity = now.getTime() >= maturityDate.getTime();
    const isMatured = bond.isMatured;

    // Calculate shortfall only when bond is past maturity but not matured
    if (!hasReachedMaturity || isMatured) return null;
    if (denominationAssetData.isLoading) return null;

    const available = denominationAssetData?.assetHolding?.available;
    const needed = bond.denominationAssetNeeded;
    if (!available) {
      return needed;
    }

    const deficit = sub(needed, available);

    return greaterThan(deficit, 0n) ? deficit : null;
  }, [bond, denominationAssetData]);

  return (
    <DetailGrid title={t("tokens:details.bondInformation")}>
      <DetailGridItem
        label={t("tokens:fields.faceValue")}
        info={t("tokens:fields.faceValueInfo")}
        value={bond.faceValue}
        type="currency"
        currency={{ assetSymbol: bond.denominationAsset.symbol }}
      />
      <DetailGridItem
        label={t("tokens:fields.denominationAssetNeeded")}
        info={t("tokens:fields.denominationAssetNeededInfo")}
        value={bond.denominationAssetNeeded}
        type="currency"
        currency={{ assetSymbol: bond.denominationAsset.symbol }}
      />
      <DetailGridItem
        label={t("tokens:fields.isMatured")}
        info={t("tokens:fields.isMaturedInfo")}
        value={bond.isMatured}
        type="boolean"
      />
      <DetailGridItem
        label={t("tokens:fields.maturityDate")}
        info={t("tokens:fields.maturityDateInfo")}
        value={bond.maturityDate}
        type="date"
        dateOptions={{ includeTime: true }}
        emptyValue={t("tokens:fields.noExpiry")}
      />
      <DetailGridItem
        label={t("tokens:fields.currentDenominationHoldings")}
        info={t("tokens:fields.currentDenominationHoldingsInfo")}
        value={
          denominationAssetData.isLoading
            ? t("data-table:loading")
            : (denominationAssetData.assetHolding?.available ?? 0n)
        }
        type="currency"
        currency={{ assetSymbol: bond.denominationAsset.symbol }}
      />
      {shortfall && (
        <DetailGridItem
          label={t("tokens:fields.shortfallToMature")}
          info={t("tokens:fields.shortfallToMatureInfo")}
          value={shortfall}
          type="currency"
          currency={{ assetSymbol: bond.denominationAsset.symbol }}
        />
      )}
      <DetailGridItem
        label={t("tokens:fields.price")}
        value={unitPrice ?? undefined}
        type="currency"
        currency={
          denominationBasePriceClaim
            ? { assetSymbol: denominationBasePriceClaim.currencyCode }
            : undefined
        }
        emptyValue={"-"}
      />
      <DetailGridItem
        label={t("tokens:fields.totalPrice")}
        info={t("tokens:fields.totalPriceInfo")}
        value={unitPrice ? multiply(unitPrice, asset.totalSupply) : undefined}
        type="currency"
        currency={
          denominationBasePriceClaim
            ? { assetSymbol: denominationBasePriceClaim.currencyCode }
            : undefined
        }
        emptyValue={"-"}
      />
      <DetailGridItem
        label={t("stats:charts.bondStatus.active.title")}
        value={bondStatus?.coveredPercentage ?? from(0)}
        type={"percentage"}
      />
    </DetailGrid>
  );
}
