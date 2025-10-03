import { assetDesignerFormOptions } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { BondSummaryFields } from "@/components/asset-designer/asset-designer-wizard/summary/bond";
import { EquitySummaryFields } from "@/components/asset-designer/asset-designer-wizard/summary/equity";
import { FundSummaryFields } from "@/components/asset-designer/asset-designer-wizard/summary/fund";
import {
  FormSummaryCard,
  FormSummaryItem,
} from "@/components/form/multi-step/form-step";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { assetClassIcon } from "@/hooks/use-asset-class";
import { useCountries } from "@/hooks/use-countries";
import { formatValue } from "@/lib/utils/format-value";
import { noop } from "@/lib/utils/noop";
import { client, orpc } from "@/orpc/orpc-client";
import type { ComplianceModulePairInput } from "@atk/zod/compliance";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Shield } from "lucide-react";
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
    const { data: baseCurrency } = useQuery(
      orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
    );

    return (
      <FormStepLayout
        title={t("wizard.steps.summary.title")}
        description={t("wizard.steps.summary.description")}
        actions={
          <>
            <Button
              disabled={form.state.isSubmitting}
              variant="outline"
              onClick={onBack}
            >
              {t("form.buttons.back")}
            </Button>
            <form.VerificationButton
              disabled={form.state.isSubmitting}
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
            />
          )}
          {"basePrice" in values && values.basePrice ? (
            <FormSummaryItem
              label={t("form.fields.basePrice.label")}
              value={formatValue(values.basePrice, {
                type: "currency",
                currency: { assetSymbol: baseCurrency ?? "" },
              })}
            />
          ) : null}
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
        {values.type === "equity" && <EquitySummaryFields form={form} />}

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

        <form.Subscribe selector={(state) => state.values}>
          {(formValues) => (
            <form.Field
              name="available"
              validators={{
                onMount: () => {
                  void form.validateField("available", "change");
                },
                onChangeAsync: async () => {
                  try {
                    const result = await client.system.factory.available({
                      parameters: formValues,
                    });
                    return result.isAvailable ? undefined : "unavailable";
                  } catch {
                    return "error";
                  }
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div className="mt-4">
                  {field.state.meta.isValidating ? (
                    <Alert>
                      <AlertDescription>
                        {t("wizard.steps.summary.availability.checking")}
                      </AlertDescription>
                    </Alert>
                  ) : field.state.meta.errors.length > 0 ? (
                    <Alert variant="destructive">
                      <AlertTitle>
                        {field.state.meta.errors[0] === "error"
                          ? t("wizard.steps.summary.availability.error")
                          : t("wizard.steps.summary.availability.unavailable")}
                      </AlertTitle>
                      <AlertDescription>
                        {field.state.meta.errors[0] === "error"
                          ? t(
                              "wizard.steps.summary.availability.errorDescription"
                            )
                          : t(
                              "wizard.steps.summary.availability.unavailableDescription"
                            )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert
                      variant="default"
                      className="border-success bg-success-background text-success"
                    >
                      <CheckCircle2 className="text-success" />
                      <AlertTitle>
                        {t("wizard.steps.summary.availability.available")}
                      </AlertTitle>
                      <AlertDescription>
                        {t(
                          "wizard.steps.summary.availability.availableDescription"
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Errors />
      </FormStepLayout>
    );
  },
});
