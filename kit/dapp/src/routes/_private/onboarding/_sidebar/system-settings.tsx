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
  const queryClient = useQueryClient();
  const { navigateToStep, completeStepAndNavigate } = useOnboardingNavigation();

  // Get current base currency setting
  const { data: currentBaseCurrency } = useQuery({
    ...orpc.settings.read.queryOptions({
      input: { key: "BASE_CURRENCY" },
    }),
    retry: false,
    throwOnError: false,
  });

  // Mutation for updating base currency
  const { mutateAsync: upsertSetting, isPending: isUpsertPending } =
    useMutation({
      ...orpc.settings.upsert.mutationOptions(),
      onSuccess: async () => {
        logger.debug("Settings mutation successful, refetching queries");
        await queryClient.refetchQueries({
          queryKey: orpc.settings.read.key({
            input: { key: "BASE_CURRENCY" },
          }),
        });

        toast.success("Platform settings saved successfully");
      },
      onError: (error) => {
        logger.error("Settings mutation failed:", error);
        toast.error("Failed to save platform settings");
      },
    });

  const form = useForm({
    defaultValues: {
      baseCurrency: currentBaseCurrency
        ? (currentBaseCurrency as FiatCurrency)
        : ("USD" as FiatCurrency),
    },
  });

  const handleSaveAndContinue = async () => {
    logger.debug("Save & Continue button clicked");
    logger.debug("Form state:", form.state);
    logger.debug("Form errors:", form.state.errors);

    try {
      const currentValue = form.state.values.baseCurrency;
      logger.debug("Saving base currency:", currentValue);

      await upsertSetting({
        key: "BASE_CURRENCY",
        value: currentValue,
      });

      logger.debug("Base currency saved successfully, navigating to next step");
      await completeStepAndNavigate(OnboardingStep.systemSettings);
    } catch (error) {
      logger.error("Failed to save base currency:", error);
      toast.error("Failed to save platform settings");
    }
  };

  const onPrevious = () => void navigateToStep(OnboardingStep.systemDeploy);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Configure Platform Settings</h2>
        <p className="text-sm text-muted-foreground pt-2">
          Define how your platform behaves by default
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4 mb-6">
            <p className="text-sm">
              Before you begin issuing assets, let's configure some basic
              settings that determine how the platform behaves. These default
              values help personalize the experience for you and your users.
            </p>
            <p className="text-sm">
              You can update these preferences later in the platform settings.
            </p>
          </div>

          <form.Field
            name="baseCurrency"
            validators={{
              onChange: ({ value }) => {
                logger.debug("Validating currency:", value);
                if (!Object.keys(fiatCurrencyMetadata).includes(value)) {
                  logger.debug("Currency validation failed:", value);
                  return "Invalid currency selection";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label htmlFor="baseCurrency" className="text-sm font-medium">
                  Base Currency
                </label>
                <p className="text-sm text-muted-foreground">
                  Choose the default currency for your platform
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

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isUpsertPending}
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={() => void handleSaveAndContinue()}
                disabled={isUpsertPending}
                className="min-w-[120px]"
              >
                {isUpsertPending ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
