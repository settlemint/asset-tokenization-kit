"use client";

import { AuthorizationStatusLayout } from "./authorization-status/layout";
import { ComplianceScoreLayout } from "./compliance-score/layout";
import { ConsumerProtectionLayout } from "./consumer-protection/layout";
import { DocumentationLayout } from "./documentation/layout";
import { KycMonitoringLayout } from "./kyc-monitoring/layout";
import { ReserveStatusLayout } from "./reserve-status/layout";

export function MicaRegulationLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-fr">
      <div className="md:col-span-2 flex">
        <ComplianceScoreLayout />
      </div>
      <div className="md:col-span-4 flex">
        <ReserveStatusLayout />
      </div>
      <div className="md:col-span-2 flex">
        <AuthorizationStatusLayout />
      </div>
      <div className="md:col-span-4 flex">
        <DocumentationLayout />
      </div>
      <div className="md:col-span-3 flex">
        <KycMonitoringLayout />
      </div>
      <div className="md:col-span-3 flex">
        <ConsumerProtectionLayout />
      </div>
    </div>
  );
}
