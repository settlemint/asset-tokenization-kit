import { assetDesignerFormOptions } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { BondSummaryFields } from "@/components/asset-designer/asset-designer-wizard/summary/bond";
import { FundSummaryFields } from "@/components/asset-designer/asset-designer-wizard/summary/fund";
import {
  FormSummaryCard,
  FormSummaryItem,
} from "@/components/form/multi-step/form-step";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { assetClassIcon } from "@/hooks/use-asset-class";
import { useCountries } from "@/hooks/use-countries";
import { noop } from "@/lib/utils/noop";
import { ComplianceModulePairInput } from "@/lib/zod/validators/compliance";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Summary = withForm({
  ...assetDesignerFormOptions,
  props: {
    onSubmit: noop,
    onBack: noop,
  },
  render: function Render({ form, onSubmit, onBack }) {
    const { t } = useTranslation([
      "asset-designer",
      "asset-types",
      "form",
      "asset-class",
      "compliance-modules",
    ]);
    const values = form.state.values;
    const Icon = assetClassIcon[values.assetClass];
    const { getCountryByNumericCode } = useCountries();

    return (
      <FormStepLayout
        title={t("wizard.steps.summary.title")}
        description={t("wizard.steps.summary.description")}
        actions={
          <>
            <Button variant="outline" onClick={onBack}>
              {t("form.buttons.back")}
            </Button>
            <form.VerificationButton
              onSubmit={onSubmit}
              walletVerification={{
                title: t("verification.confirm-title"),
                description: t("verification.confirm-description"),
                setField: (verification) => {
                  form.setFieldValue("walletVerification", verification);
                },
              }}
            >
              {t("form.actions.create", { type: form.state.values.type })}
            </form.VerificationButton>
          </>
        }
        fullWidth
      >
        <FormSummaryCard
          icon={<Icon className="w-5 h-5" />}
          title={t("wizard.steps.summary.generalInfo.title")}
          description={t("wizard.steps.summary.generalInfo.description", {
            type: t(`asset-types:types.${values.type}.nameLowercaseSingular`),
          })}
        >
          <FormSummaryItem
            label={t("form.fields.name.label")}
            value={values.name || "-"}
          />
          <FormSummaryItem
            label={t("form.fields.symbol.label")}
            value={values.symbol || "-"}
          />
          <FormSummaryItem
            label={t("form.fields.decimals.label")}
            value={values.decimals ?? "-"}
          />
          {values.isin && (
            <FormSummaryItem
              label={t("form.fields.isin.label")}
              value={values.isin}
              secret
            />
          )}
          <FormSummaryItem
            label={t("form.fields.countryCode.label")}
            value={getCountryByNumericCode(values.countryCode) || "-"}
          />
          <FormSummaryItem
            label={t("form.fields.assetClass.label")}
            value={t(`asset-class:categories.${values.assetClass}.name`)}
          />
        </FormSummaryCard>

        {values.type === "bond" && <BondSummaryFields form={form} />}
        {values.type === "fund" && <FundSummaryFields form={form} />}

        {values.initialModulePairs && values.initialModulePairs.length > 0 && (
          <FormSummaryCard
            icon={<Shield className="w-5 h-5" />}
            title={t("wizard.steps.summary.complianceModules.title")}
            description={t(
              "wizard.steps.summary.complianceModules.description",
              {
                type: t(
                  `asset-types:types.${values.type}.nameLowercaseSingular`
                ),
              }
            )}
          >
            {values.initialModulePairs.map(
              (pair: ComplianceModulePairInput, index: number) => (
                <FormSummaryItem
                  key={index}
                  label={t(`compliance-modules:complianceModuleName`)}
                  value={t(`compliance-modules:modules.${pair.typeId}.title`)}
                />
              )
            )}
          </FormSummaryCard>
        )}

        <form.Errors />
      </FormStepLayout>
    );
  },
});
