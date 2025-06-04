"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronDown, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ComplianceStatusProps {
  isCompliant: boolean;
}

function ComplianceStatus({ isCompliant }: ComplianceStatusProps) {
  const t = useTranslations("regulations.mica.dashboard.compliance-status");

  return (
    <Badge
      className={`
        ${
          isCompliant
            ? "bg-success text-success-foreground"
            : "bg-destructive text-destructive-foreground"
        }
      `}
    >
      {isCompliant ? (
        <CheckCircle className="size-4" />
      ) : (
        <XCircle className="size-4" />
      )}
      {isCompliant ? t("compliant") : t("non-compliant")}
    </Badge>
  );
}

interface RequirementProps {
  title: string;
  description: string;
  isCompliant: boolean;
}

function Requirement({ title, description, isCompliant }: RequirementProps) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="flex gap-3">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ComplianceStatus isCompliant={isCompliant} />
    </div>
  );
}

export function ComplianceScoreLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("regulations.mica.dashboard.compliance-status");

  // Temporary hardcoded values for UI development
  const mockCompliance = {
    reserves: {
      title: t("reserve-status"),
      description: t("reserve-status-description"),
      isCompliant: false,
    },
    authorization: {
      title: t("authorization-status"),
      description: t("authorization-status-description"),
      isCompliant: true,
    },
    kyc: {
      title: t("kyc-aml-monitoring"),
      description: t("kyc-aml-monitoring-description"),
      isCompliant: false,
    },
    consumerProtection: {
      title: t("consumer-protection"),
      description: t("consumer-protection-description"),
      isCompliant: true,
    },
    documentation: {
      title: t("documentation"),
      description: t("documentation-description"),
      isCompliant: false,
    },
  };

  const requirements = Object.values(mockCompliance);
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
