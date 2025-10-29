/**
 * Claim Topics and Issuers Overview Component
 *
 * Provides identity managers with high-level metrics about the compliance
 * infrastructure state across three interconnected dimensions: active claims,
 * topic schemes, and trusted issuers.
 *
 * WHY THIS COMPONENT EXISTS:
 * In a tokenized asset platform, identity verification depends on a trust network
 * where authorized issuers create claims about identities according to predefined
 * topic schemes. Identity managers need visibility into this infrastructure health
 * to ensure the compliance system remains operational and properly configured.
 *
 * ARCHITECTURAL RATIONALE:
 * - Aggregates three separate TheGraph queries rather than one combined query
 *   because the blockchain emits these metrics from distinct smart contract
 *   registries (ClaimTopicsRegistry, TopicSchemeRegistry, TrustedIssuersRegistry)
 * - Uses suspense queries to enable parallel data fetching while maintaining
 *   loading state coordination through React Suspense boundaries
 * - Fetches only "active" counts (not total/removed) because managers primarily
 *   care about current operational capacity, not historical audit trails
 *
 * DATA SOURCES (via TheGraph):
 * 1. Claims: Aggregated from ClaimTopicsRegistry events (added/removed/revoked)
 * 2. Topic Schemes: Derived from TopicSchemeRegistry registration/removal events
 * 3. Trusted Issuers: Tracked via TrustedIssuersRegistry add/remove events
 *
 * INTEGRATION CONTEXT:
 * - Rendered conditionally on the dashboard home page only for users with
 *   identityManager role permissions (role-based access control enforcement)
 * - Positioned after IdentityMetrics to provide complementary compliance oversight
 * - Uses shared StatCard widgets for visual consistency with other dashboard sections
 *
 * DESIGN DECISIONS:
 * - Three separate queries over one combined query: Matches blockchain event
 *   architecture and allows independent cache invalidation per registry
 * - Locale-aware number formatting: Ensures international users see culturally
 *   appropriate thousand separators and digit grouping
 * - Icon selection: ShieldCheck (claims security), Tag (topic categorization),
 *   CheckCircle2 (trusted/verified issuers) - chosen for semantic clarity
 */

import { SectionSubtitle } from "@/components/dashboard/section-subtitle";
import { SectionTitle } from "@/components/dashboard/section-title";
import { StatCard } from "@/components/stats/widgets/stat-widget";
import { formatNumber } from "@/lib/utils/format-value/format-number";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, ShieldCheck, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ClaimTopicsIssuersOverview() {
  const { t, i18n } = useTranslation("dashboard");
  // Extract locale from i18n rather than hardcoding to support dynamic language
  // switching without component remount (preserves user's active session preferences)
  const locale = i18n.language;

  // Query blockchain-indexed statistics from TheGraph subgraph for each registry.
  // Using suspense queries to leverage React Suspense for coordinated loading states
  // and to enable parallel data fetching (all three queries execute simultaneously
  // rather than sequentially, reducing total wait time for users).
  //
  // WHY SEPARATE QUERIES:
  // Each registry is a distinct smart contract with independent state, so combining
  // into one query would require custom resolver logic without performance benefits.
  // Separate queries also enable granular cache invalidation when specific registry
  // events occur (e.g., new trusted issuer added invalidates only issuersData cache).
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
      {/* Section header using shared typography components for dashboard consistency.
          Internationalized strings sourced from locales/<lang>/dashboard.json */}
      <div className="flex flex-col gap-2">
        <SectionTitle>{t("claimTopicsIssuersOverview.title")}</SectionTitle>
        <SectionSubtitle>
          {t("claimTopicsIssuersOverview.description")}
        </SectionSubtitle>
      </div>

      {/* Three-column responsive grid layout that stacks on mobile (grid-cols-1)
          and displays side-by-side on tablets and desktop (sm:grid-cols-3).

          ORDERING RATIONALE:
          Claims → Topics → Issuers follows the logical dependency chain:
          1. Claims are the end result (what users see)
          2. Topics define what claims are possible (schema layer)
          3. Issuers provide the authority to create those claims (trust layer)

          This left-to-right ordering helps identity managers understand the
          compliance infrastructure from outcomes back to foundations. */}
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
          icon={ShieldCheck}
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
          icon={Tag}
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
          icon={CheckCircle2}
        />
      </div>
    </div>
  );
}
