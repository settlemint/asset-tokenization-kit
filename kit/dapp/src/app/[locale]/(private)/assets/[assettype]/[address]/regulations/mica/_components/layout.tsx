"use client";

import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { AuthorizationStatusLayout } from "./authorization-status/layout";
import { ComplianceScoreLayout } from "./compliance-score/layout";
import { ConsumerProtectionLayout } from "./consumer-protection/layout";
import { DocumentationLayout } from "./documentation/layout";
import { KycMonitoringLayout } from "./kyc-monitoring/layout";
import { ReserveStatusLayout } from "./reserve-status/layout";

export function MicaRegulationLayout({
  config,
}: {
  config: MicaRegulationConfig;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div className="md:col-span-2">
        <ComplianceScoreLayout />
      </div>
      <div className="md:col-span-4">
        <ReserveStatusLayout config={config} />
      </div>
      <div className="md:col-span-2">
        <AuthorizationStatusLayout />
      </div>
      <div className="md:col-span-4">
        <DocumentationLayout />
      </div>
      <div className="md:col-span-3">
        <KycMonitoringLayout />
      </div>
      <div className="md:col-span-3">
        <ConsumerProtectionLayout />
      </div>
    </div>
  );
}
