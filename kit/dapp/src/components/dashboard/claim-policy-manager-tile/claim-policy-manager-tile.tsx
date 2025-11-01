import { PercentageChange } from "@/components/stats/percentage-change";
import { StatList } from "@/components/stats/stat-list";
import {
  Tile,
  TileContent,
  TileDescription,
  TileFooter,
  TileFooterAction,
  TileHeader,
  TileHeaderContent,
  TileIcon,
  TileTitle,
} from "@/components/tile/tile";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Claim Policy Manager dashboard tile for monitoring trusted issuer activity.
 *
 * Displays active issuer count with 7-day trend and highlights recent additions
 * since new issuers expand claim issuance capabilities and policy coverage.
 */
export function ClaimPolicyManagerTile() {
  const { t } = useTranslation("dashboard");

  const { data: counts } = useSuspenseQuery(
    orpc.system.stats.trustedIssuerStatsState.queryOptions({
      input: {},
    })
  );

  const { data: statsOverTime } = useSuspenseQuery(
    orpc.system.stats.trustedIssuerStatsByPreset.queryOptions({
      input: { preset: "trailing7Days" },
    })
  );

  // Extract first and last data points for 7-day active issuer growth percentage
  const firstValue = statsOverTime.data[0]?.totalActiveTrustedIssuers;
  const lastValue = statsOverTime.data.at(-1)?.totalActiveTrustedIssuers;

  // Calculate 7-day changes by comparing endpoints of time series
  const addedIn7Days =
    (statsOverTime.data.at(-1)?.totalAddedTrustedIssuers ?? 0) -
    (statsOverTime.data[0]?.totalAddedTrustedIssuers ?? 0);

  const removedIn7Days =
    (statsOverTime.data.at(-1)?.totalRemovedTrustedIssuers ?? 0) -
    (statsOverTime.data[0]?.totalRemovedTrustedIssuers ?? 0);

  // Format stat text with conditional +/- prefix (only shown when value > 0)
  const addedText = t(
    addedIn7Days === 1
      ? "claimPolicyManagerCard.stats.addedSingular"
      : "claimPolicyManagerCard.stats.addedPlural",
    { count: addedIn7Days }
  );

  const removedText = t(
    removedIn7Days === 1
      ? "claimPolicyManagerCard.stats.removedSingular"
      : "claimPolicyManagerCard.stats.removedPlural",
    { count: removedIn7Days }
  );

  return (
    <Tile>
      <TileHeader>
        <TileIcon icon={ScrollText} color="chart-5" />
        <TileHeaderContent>
          <TileTitle>{t("claimPolicyManagerCard.title")}</TileTitle>
        </TileHeaderContent>
      </TileHeader>

      <TileContent>
        <TileDescription>
          {t("claimPolicyManagerCard.description")}
        </TileDescription>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t("claimPolicyManagerCard.stats.activeIssuers")}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums">
              {counts.totalActiveTrustedIssuers}
            </span>
            <PercentageChange
              previousValue={firstValue}
              currentValue={lastValue}
              period="trailing7Days"
            />
          </div>
          <StatList
            items={[
              {
                text: addedIn7Days > 0 ? `+${addedText}` : addedText,
                variant: addedIn7Days > 0 ? "success" : "foreground",
              },
              {
                text: removedIn7Days > 0 ? `-${removedText}` : removedText,
                variant: removedIn7Days > 0 ? "destructive" : "foreground",
              },
            ]}
          />
        </div>
      </TileContent>

      <TileFooter>
        <TileFooterAction
          to="/platform-settings/claim-topics-issuers"
          variant="outline"
          className="w-full"
        >
          {t("claimPolicyManagerCard.cta")}
        </TileFooterAction>
      </TileFooter>
    </Tile>
  );
}
