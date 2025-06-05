"use client";

import { StatusPill } from "@/components/blocks/status-pill/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import {
  hasRequiredDocuments,
  isAuthorized,
  isReserveCompliant,
} from "@/lib/utils/mica";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface RequirementProps {
  title: string;
  description: string;
  isCompliant: boolean;
}

function Requirement({ title, description, isCompliant }: RequirementProps) {
  const t = useTranslations("regulations.mica.dashboard.compliance-status");

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="flex gap-3">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <StatusPill
        status={isCompliant ? "success" : "warning"}
        label={isCompliant ? t("compliant") : t("non-compliant")}
      />
    </div>
  );
}

interface ComplianceScoreLayoutProps {
  config: MicaRegulationConfig;
}

export function ComplianceScoreLayout({ config }: ComplianceScoreLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("regulations.mica.dashboard.compliance-status");

  const requirements = [
    {
      title: t("reserve-status"),
      description: t("reserve-status-description"),
      isCompliant: isReserveCompliant(config),
    },
    {
      title: t("authorization-status"),
      description: t("authorization-status-description"),
      isCompliant: isAuthorized(config),
    },
    {
      title: t("kyc-aml-monitoring"),
      description: t("kyc-aml-monitoring-description"),
      isCompliant: true, // Always compliant as per requirements
    },
    {
      title: t("consumer-protection"),
      description: t("consumer-protection-description"),
      isCompliant: true, // Always compliant as per requirements
    },
    {
      title: t("documentation"),
      description: t("documentation-description"),
      isCompliant: hasRequiredDocuments(config),
    },
  ];

  const compliantCount = requirements.filter((req) => req.isCompliant).length;
  const compliancePercentage = (compliantCount / requirements.length) * 100;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Compliance Score</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-2xl font-semibold">
                {compliantCount} {t("of")} {requirements.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("requirements-compliant")}
              </p>
            </div>
            <p className="text-2xl font-semibold">{compliancePercentage}%</p>
          </div>
          <Progress value={compliancePercentage} className="h-2" />
        </div>

        <div>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between p-0 h-9"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>{t("view-details")}</span>
            <ChevronDown
              className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </Button>

          {isExpanded && (
            <div className="space-y-3 mt-4">
              {requirements.map((requirement, index) => (
                <Requirement key={index} {...requirement} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
