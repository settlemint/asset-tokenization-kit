import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import {
  fiatCurrencyMetadata,
  type FiatCurrency,
} from "@/lib/zod/validators/fiat-currency";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const queryClient = useQueryClient();
  const { completeStepAndNavigate } = useOnboardingNavigation();

  // Get current base currency setting
  const { data: currentBaseCurrency } = useQuery({
    ...orpc.settings.read.queryOptions({
      input: { key: "BASE_CURRENCY" },
    }),
    retry: false,
    throwOnError: false,
  });

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
          await syncExchangeRates({
            force: true,
          });
          await completeStepAndNavigate(OnboardingStep.systemSettings);
        },
      })
    );

  const { mutateAsync: syncExchangeRates } = useMutation(
    orpc.exchangeRates.sync.mutationOptions()
  );

  const form = useForm({
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
    <OnboardingStepLayout
      title={t("system-settings.title")}
      description={t("system-settings.subtitle")}
      actions={
        <Button
          type="button"
          onClick={() => {
            handleSaveAndContinue();
          }}
          disabled={isSettingUpdating}
          className="min-w-[120px]"
        >
          {isSettingUpdating
            ? t("system-settings.buttons.saving")
            : t("system-settings.buttons.saveAndContinue")}
        </Button>
      }
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4 mb-6">
            <p className="text-sm">{t("system-settings.description.intro")}</p>
            <p className="text-sm">{t("system-settings.description.update")}</p>
          </div>

          <form.Field
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
              <div className="space-y-2">
                <label htmlFor="baseCurrency" className="text-sm font-medium">
                  {t("system-settings.form.baseCurrency.label")}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t("system-settings.form.baseCurrency.description")}
                </p>
                <select
                  id="baseCurrency"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value as FiatCurrency);
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  {Object.entries(fiatCurrencyMetadata).map(
                    ([code, metadata]) => (
                      <option key={code} value={code}>
                        {metadata.name} ({code})
                      </option>
                    )
                  )}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive mt-2">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>
    </OnboardingStepLayout>
  );
}
