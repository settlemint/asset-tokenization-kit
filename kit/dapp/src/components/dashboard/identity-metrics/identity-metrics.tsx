import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, UserCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SectionSubtitle } from "@/components/dashboard/section-subtitle";
import { SectionTitle } from "@/components/dashboard/section-title";
import { IdentityGrowthAreaChart } from "@/components/stats/charts/identity-growth-area-chart";
import { StatCard } from "@/components/stats/widgets/stat-widget";

export function IdentityMetrics() {
  const { t } = useTranslation("dashboard");

  const { data } = useSuspenseQuery(
    orpc.system.stats.identityCount.queryOptions()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <SectionTitle>{t("identityMetrics.title")}</SectionTitle>
        <SectionSubtitle>{t("identityMetrics.description")}</SectionSubtitle>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title={t("identityMetrics.totalIdentities")}
          value={data.userIdentitiesCreatedCount}
          icon={Users}
        />
        <StatCard
          title={t("identityMetrics.activeRegistrations")}
          value={data.activeUserIdentitiesCount}
          icon={UserCheck}
        />
        <StatCard
          title={t("identityMetrics.pendingIdentities")}
          value={data.pendingRegistrationsCount}
          icon={Clock}
        />
      </div>

      <div className="w-full">
        <IdentityGrowthAreaChart />
      </div>
    </div>
  );
}
