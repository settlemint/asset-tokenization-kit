import {
  type FiatCurrency,
  fiatCurrencyMetadata,
} from "@atk/zod/validators/fiat-currency";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";

const logger = createLogger();

// TODO: rename to platform settings
// TODO: pull this out of the system step as it has nothing to do with the smart contracts
// TODO: this step should also sync the exchange rates so we have them before a user starts
export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-settings"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemSettings),
  component: RouteComponent,
});

const BASE_CURRENCY_OPTIONS = Object.entries(fiatCurrencyMetadata).map(
  ([code, metadata]) => ({
    label: `${metadata.name} (${code})`,
    value: code,
  })
);

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const queryClient = useQueryClient();
  const { completeStepAndNavigate } = useOnboardingNavigation();

  // Get current base currency setting
  const { data: currentBaseCurrency } = useQuery(
    orpc.settings.read.queryOptions({
      input: { key: "BASE_CURRENCY" },
      retry: false,
      throwOnError: false,
    })
  );

  const { mutateAsync: syncExchangeRates } = useMutation(
    orpc.exchangeRates.sync.mutationOptions()
  );

  // Mutation for updating base currency
  const { mutateAsync: upsertSetting, isPending: isSettingUpdating } =
    useMutation(
      orpc.settings.upsert.mutationOptions({
        onSuccess: async () => {
          logger.debug("Settings mutation successful, refetching queries");
          await queryClient.refetchQueries({
            queryKey: orpc.settings.read.key({
              input: { key: "BASE_CURRENCY" },
            }),
          });

          // Sync exchange rates but don't let failures block navigation
          try {
            await syncExchangeRates({
              force: true,
            });
            logger.debug("Exchange rates synced successfully");
          } catch (error) {
            logger.error("Failed to sync exchange rates:", error);
            // Show a non-blocking warning toast
            toast.warning(t("system-settings.toast.exchangeRateSyncWarning"));
          }

          await completeStepAndNavigate(OnboardingStep.systemSettings);
        },
      })
    );

  const form = useAppForm({
    defaultValues: {
      baseCurrency: currentBaseCurrency ?? ("USD" as FiatCurrency),
    },
  });

  const handleSaveAndContinue = () => {
    logger.debug("Save & Continue button clicked");
    logger.debug("Form state:", form.state);
    logger.debug("Form errors:", form.state.errors);

    const currentValue = form.state.values.baseCurrency;
    logger.debug("Saving base currency:", currentValue);

    toast.promise(
      upsertSetting({
        key: "BASE_CURRENCY",
        value: currentValue as FiatCurrency,
      }),
      {
        loading: t("system-settings.toast.saving"),
        success: t("system-settings.toast.success"),
        error: (error: Error) =>
          t("system-settings.toast.error", {
            message: error.message,
          }),
      }
    );
  };

  return (
    <FormStepLayout
      title={t("system-settings.title")}
      fullWidth={true}
      description={t("system-settings.subtitle")}
      actions={
        <Button
          type="button"
          onClick={() => {
            handleSaveAndContinue();
          }}
          disabled={isSettingUpdating}
          className="min-w-[120px] press-effect"
        >
          {isSettingUpdating
            ? t("system-settings.buttons.saving")
            : t("system-settings.buttons.saveAndContinue")}
        </Button>
      }
    >
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-4 mb-6">
            <p className="text-sm">{t("system-settings.description.intro")}</p>
            <p className="text-sm">{t("system-settings.description.update")}</p>
          </div>

          <form.AppField
            name="baseCurrency"
            validators={{
              onChange: ({ value }) => {
                logger.debug("Validating currency:", value);
                if (!Object.keys(fiatCurrencyMetadata).includes(value)) {
                  logger.debug("Currency validation failed:", value);
                  return t(
                    "system-settings.form.baseCurrency.validation.invalid"
                  );
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.SelectField
                label={t("system-settings.form.baseCurrency.label")}
                description={t("system-settings.form.baseCurrency.description")}
                options={BASE_CURRENCY_OPTIONS}
              />
            )}
          </form.AppField>
        </div>
      </div>
    </FormStepLayout>
  );
}
