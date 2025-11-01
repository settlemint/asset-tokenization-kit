import { PercentageChange } from "@/components/stats/percentage-change";
import { StatList } from "@/components/stats/stat-list";
import {
  Tile,
  TileBadge,
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
import { CheckCircle2, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Identity Manager dashboard tile providing at-a-glance identity verification status.
 *
 * Highlights pending registrations with warning badges since unverified users
 * cannot participate in asset transactions.
 */
export function IdentityManagerTile() {
  const { t } = useTranslation("dashboard");

  const { data: counts } = useSuspenseQuery(
    orpc.system.stats.identityCount.queryOptions({
      input: {},
    })
  );

  const { data: statsOverTime } = useSuspenseQuery(
    orpc.system.stats.identityStatsOverTimeByPreset.queryOptions({
      input: { preset: "trailing7Days" },
    })
  );

  // Extract first and last data points for 7-day identity growth percentage
  const firstValue = statsOverTime.identityStats[0]?.activeUserIdentitiesCount;
  const lastValue =
    statsOverTime.identityStats.at(-1)?.activeUserIdentitiesCount;

  const hasPending = counts.pendingRegistrationsCount > 0;

  return (
    <Tile>
      <TileHeader>
        <TileIcon icon={Shield} color="chart-4" />
        <TileHeaderContent>
          <TileTitle>{t("identityManagerCard.title")}</TileTitle>
        </TileHeaderContent>
        <TileBadge
          variant={hasPending ? "warning" : "success"}
          className="gap-1.5"
        >
          {hasPending ? (
            t(
              counts.pendingRegistrationsCount === 1
                ? "identityManagerCard.badge.pendingVerificationSingular"
                : "identityManagerCard.badge.pendingVerificationPlural",
              {
                count: counts.pendingRegistrationsCount,
              }
            )
          ) : (
            <>
              <CheckCircle2 className="size-3" aria-hidden="true" />
              {t("identityManagerCard.badge.allVerified")}
            </>
          )}
        </TileBadge>
      </TileHeader>

      <TileContent>
        <TileDescription>
          {t("identityManagerCard.description")}
        </TileDescription>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t("identityManagerCard.stats.activeIdentities")}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums">
              {counts.activeUserIdentitiesCount}
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
                text: t("identityManagerCard.stats.active", {
                  count: counts.activeUserIdentitiesCount,
                }),
                variant: "foreground",
              },
              {
                text: t(
                  counts.pendingRegistrationsCount === 1
                    ? "identityManagerCard.stats.pendingVerificationSingular"
                    : "identityManagerCard.stats.pendingVerificationPlural",
                  {
                    count: counts.pendingRegistrationsCount,
                  }
                ),
                variant: hasPending ? "warning" : "foreground",
              },
            ]}
          />
        </div>
      </TileContent>

      <TileFooter>
        <TileFooterAction
          to="/participants/users"
          variant="outline"
          className="w-full"
        >
          {t("identityManagerCard.cta")}
        </TileFooterAction>
      </TileFooter>
    </Tile>
  );
}
