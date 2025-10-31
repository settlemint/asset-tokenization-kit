import { ClaimTopicsCoverage } from "@/components/dashboard/claim-topics-coverage/claim-topics-coverage";
import { SectionSubtitle } from "@/components/dashboard/section-subtitle";
import { SectionTitle } from "@/components/dashboard/section-title";
import { StatCard } from "@/components/stats/widgets/stat-widget";
import { formatNumber } from "@/lib/utils/format-value/format-number";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function ClaimTopicsIssuersOverview() {
  const { t, i18n } = useTranslation("dashboard");
  const locale = i18n.language;

  const { data: claimsData } = useSuspenseQuery(
    orpc.system.stats.claimsStatsState.queryOptions()
  );

  const { data: topicsData } = useSuspenseQuery(
    orpc.system.stats.topicSchemesStatsState.queryOptions()
  );

  const { data: issuersData } = useSuspenseQuery(
    orpc.system.stats.trustedIssuerStatsState.queryOptions()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <SectionTitle>{t("claimTopicsIssuersOverview.title")}</SectionTitle>
        <SectionSubtitle>
          {t("claimTopicsIssuersOverview.description")}
        </SectionSubtitle>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Active Claims: The number of currently valid identity claims in the system.
            Excludes removed and revoked claims because only active claims affect
            compliance checks and transaction authorization logic. */}
        <StatCard
          title={t("claimTopicsIssuersOverview.totalActiveClaims")}
          value={formatNumber(
            claimsData.totalActiveClaims,
            { type: "number" },
            locale
          )}
          description={t("claimTopicsIssuersOverview.activeClaimsDescription")}
        />

        {/* Active Topic Schemes: Categories of identity attributes that can be verified
            (e.g., KYC level, accredited investor status, residency jurisdiction).
            Active count indicates the breadth of compliance rules currently enforceable. */}
        <StatCard
          title={t("claimTopicsIssuersOverview.totalActiveTopics")}
          value={formatNumber(
            topicsData.totalActiveTopicSchemes,
            { type: "number" },
            locale
          )}
          description={t("claimTopicsIssuersOverview.activeTopicsDescription")}
        />

        {/* Active Trusted Issuers: Entities authorized to issue claims (e.g., KYC providers,
            regulators, auditors). Active count represents the size of the trust network
            and affects system resilience (more issuers = less single point of failure). */}
        <StatCard
          title={t("claimTopicsIssuersOverview.totalActiveIssuers")}
          value={formatNumber(
            issuersData.totalActiveTrustedIssuers,
            { type: "number" },
            locale
          )}
          description={t("claimTopicsIssuersOverview.activeIssuersDescription")}
        />
      </div>
      <ClaimTopicsCoverage />
    </div>
  );
}
