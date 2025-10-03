import {
  ComplianceDetailActions,
  ComplianceDetailBreadcrumb,
  ComplianceDetailCard,
  ComplianceDetailContent,
  ComplianceDetailDescription,
  ComplianceDetailFooter,
  ComplianceDetailForm,
  ComplianceDetailHeader,
  ComplianceDetailSection,
  ComplianceDetailTitle,
} from "@/components/compliance/details/compliance-detail-card";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { ExpressionBuilder } from "@/components/expression-builder/expression-builder";
import { validateUIExpression } from "@/components/expression-builder/expression-builder.utils";
import { Button } from "@/components/ui/button";
import { type ExpressionWithGroups } from "@atk/zod/expression-node";
import { UserIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function IdentityRestrictionModuleDetail({
  typeId,
  module,
  isEnabled,
  initialValues,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps<"SMARTIdentityVerificationComplianceModule">) {
  const { t } = useTranslation(["compliance-modules", "form"]);

  const [expressionWithGroups, setExpressionWithGroups] =
    useState<ExpressionWithGroups>(initialValues?.values ?? []);

  const handleEnable = () => {
    onEnable({
      typeId,
      module,
      values: expressionWithGroups,
    });
  };

  const handleDisable = () => {
    onDisable({
      typeId,
      module,
      values: expressionWithGroups,
    });
    onClose();
  };

  return (
    <ComplianceDetailCard>
      <ComplianceDetailHeader>
        <ComplianceDetailBreadcrumb onClose={onClose}>
          {t("title")}
        </ComplianceDetailBreadcrumb>
      </ComplianceDetailHeader>

      <ComplianceDetailContent>
        <ComplianceDetailSection>
          <ComplianceDetailTitle
            icon={<UserIcon className="w-6 h-6" />}
            action={
              <ComplianceDetailActions
                isEnabled={isEnabled}
                onEnable={handleEnable}
                onDisable={handleDisable}
                onClose={onClose}
              />
            }
          >
            {t(`modules.${typeId}.title`)}
          </ComplianceDetailTitle>

          <ComplianceDetailDescription>
            {t(`modules.${typeId}.description`)}
          </ComplianceDetailDescription>

          <ComplianceDetailForm>
            {isEnabled && (
              <ExpressionBuilder
                expressionWithGroups={expressionWithGroups}
                onChange={setExpressionWithGroups}
              />
            )}
          </ComplianceDetailForm>
        </ComplianceDetailSection>
      </ComplianceDetailContent>

      <ComplianceDetailFooter>
        <Button variant="outline" onClick={onClose} className="press-effect">
          {t("form:buttons.back")}
        </Button>
        <Button
          disabled={
            !isEnabled ||
            expressionWithGroups.length === 0 ||
            !validateUIExpression(expressionWithGroups)
          }
          onClick={() => {
            handleEnable();
            onClose();
          }}
          className="press-effect"
        >
          {t("form:buttons.save")}
        </Button>
      </ComplianceDetailFooter>
    </ComplianceDetailCard>
  );
}
