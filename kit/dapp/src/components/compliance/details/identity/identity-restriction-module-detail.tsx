"use client";

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
import { Button } from "@/components/ui/button";
import type {
  ExpressionNode,
  ExpressionWithGroups,
} from "@/lib/zod/validators/expression-node";
import { UserIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { encodeAbiParameters, parseAbiParameters } from "viem";

type IdentityModuleType =
  | "IdentityAllowListComplianceModule"
  | "IdentityBlockListComplianceModule";

export function IdentityRestrictionModuleDetail({
  typeId,
  module,
  isEnabled,
  initialValues,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps<IdentityModuleType>) {
  const { t } = useTranslation(["compliance-modules", "form"]);

  // Determine translation keys based on module type
  const moduleKey =
    typeId === "IdentityAllowListComplianceModule"
      ? "identityAllowList"
      : "identityBlockList";

  // Initialize expression from params if available
  const initialExpression: ExpressionWithGroups = initialValues?.params
    ? [] // TODO: Decode from initialValues.params when needed
    : [];

  const [expression, setExpression] =
    useState<ExpressionWithGroups>(initialExpression);
  const [isValid, setIsValid] = useState(false);
  const [isInputChanged, setIsInputChanged] = useState(false);

  const handleExpressionChange = (newExpression: ExpressionWithGroups) => {
    setExpression(newExpression);
    setIsInputChanged(
      JSON.stringify(newExpression, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ) !==
        JSON.stringify(initialExpression, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
    );
  };

  const encodeExpressionParams = (_expr: ExpressionWithGroups): string => {
    // TODO: const postfixNodes = convertToPostfix(expr);
    const postfixNodes = [] as ExpressionNode[];
    if (postfixNodes.length === 0) return "";

    // Encode as (uint8,uint256)[] array
    return encodeAbiParameters(parseAbiParameters("(uint8,uint256)[]"), [
      postfixNodes.map(
        (node) => [node.nodeType as number, node.value] as const
      ),
    ]);
  };

  const handleEnable = () => {
    if (isValid) {
      const encodedParams = encodeExpressionParams(expression);
      onEnable({
        typeId,
        module,
        values: expression,
        params: encodedParams,
      });
      setIsInputChanged(false);
    }
  };

  const handleDisable = () => {
    onDisable({
      typeId,
      module,
      values: expression,
      params: "",
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
            {t(`modules.${moduleKey}.title`)}
          </ComplianceDetailTitle>

          <ComplianceDetailDescription>
            {t(`modules.${moduleKey}.description`)}
          </ComplianceDetailDescription>

          <ComplianceDetailForm>
            <ExpressionBuilder
              value={expression}
              onChange={handleExpressionChange}
              onValidityChange={setIsValid}
            />
          </ComplianceDetailForm>
        </ComplianceDetailSection>
      </ComplianceDetailContent>

      <ComplianceDetailFooter>
        <Button variant="outline" onClick={onClose} className="press-effect">
          {t("form:buttons.back")}
        </Button>
        <Button
          disabled={!isEnabled || !isInputChanged}
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
