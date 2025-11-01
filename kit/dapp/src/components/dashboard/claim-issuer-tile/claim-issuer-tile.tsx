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
import { BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ClaimsActivityChart } from "./claims-activity-chart";

/**
 * Claim issuer overview showing active claims, issuance/revocation activity, and 7-day trend.
 *
 * Displays total active claims as the primary metric with percentage change over the last 7 days.
 * Tracks claims issued and revoked during the trailing 7-day period to provide visibility into
 * identity verification activity. The mini bar chart visualizes daily claim activity trends.
 */
export function ClaimIssuerTile() {
  const { t } = useTranslation("dashboard");

  const { data: currentState } = useSuspenseQuery(
    orpc.system.stats.claimsStatsState.queryOptions()
  );

  const { data: statsOverTime } = useSuspenseQuery(
    orpc.system.stats.claimsStatsByPreset.queryOptions({
      input: { preset: "trailing7Days" },
    })
  );

  // Extract first and last data points to calculate 7-day active claims growth percentage
  const firstValue = statsOverTime.data.at(0)?.totalActiveClaims ?? 0;
  const lastValue = statsOverTime.data.at(-1)?.totalActiveClaims ?? 0;

  // Calculate total claims issued in last 7 days by finding the difference between
  // the last and first data points in the time series
  const issuedLast7Days =
    (statsOverTime.data.at(-1)?.totalIssuedClaims ?? 0) -
    (statsOverTime.data.at(0)?.totalIssuedClaims ?? 0);

  // Calculate total claims revoked in last 7 days using the same difference approach
  const revokedLast7Days =
    (statsOverTime.data.at(-1)?.totalRevokedClaims ?? 0) -
    (statsOverTime.data.at(0)?.totalRevokedClaims ?? 0);

  // Format stat text with conditional +/- prefix (only shown when value > 0)
  const issuedText = t("claimIssuerCard.stats.issued", {
    count: issuedLast7Days,
  });

  const revokedText = t("claimIssuerCard.stats.revoked", {
    count: revokedLast7Days,
  });

  return (
    <Tile>
      <TileHeader>
        <TileIcon icon={BadgeCheck} color="chart-5" />
        <TileHeaderContent>
          <TileTitle>{t("claimIssuerCard.title")}</TileTitle>
        </TileHeaderContent>
      </TileHeader>

      <TileContent>
        <TileDescription>{t("claimIssuerCard.description")}</TileDescription>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-sm text-muted-foreground">
              {t("claimIssuerCard.stats.activeClaims")}
            </span>
            <div className="space-y-2">
              <div className="text-3xl font-bold tabular-nums">
                {currentState.totalActiveClaims}
              </div>
              <PercentageChange
                previousValue={firstValue}
                currentValue={lastValue}
                period="trailing7Days"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <ClaimsActivityChart data={statsOverTime} />
          </div>
        </div>
        <StatList
          items={[
            {
              text: issuedLast7Days > 0 ? `+${issuedText}` : issuedText,
              variant: issuedLast7Days > 0 ? "success" : "foreground",
            },
            {
              text: revokedLast7Days > 0 ? `-${revokedText}` : revokedText,
              variant: revokedLast7Days > 0 ? "destructive" : "foreground",
            },
          ]}
        />
      </TileContent>

      <TileFooter>
        <TileFooterAction
          to="/platform-settings/claim-topics-issuers"
          variant="outline"
          className="w-full"
        >
          {t("claimIssuerCard.cta")}
        </TileFooterAction>
      </TileFooter>
    </Tile>
  );
}
