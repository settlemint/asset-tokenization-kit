import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import {
  fiatCurrencyMetadata,
  type FiatCurrency,
} from "@/lib/zod/validators/fiat-currency";
import { orpc } from "@/orpc/orpc-client";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useCallback } from "react";
import { toast } from "sonner";

const logger = createLogger();

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-settings"
)({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.fetchQuery({
      ...orpc.user.me.queryOptions(),
      staleTime: 0,
    });

    // Check if a system exists
    let hasSystem = false;
    try {
      const systemAddress = await queryClient.fetchQuery({
        ...orpc.settings.read.queryOptions({
          input: { key: "SYSTEM_ADDRESS" },
        }),
        staleTime: 0,
      });
      hasSystem = !!(systemAddress && systemAddress.trim() !== "");
    } catch {
      hasSystem = false;
    }

    const { currentStep } = updateOnboardingStateMachine({ user, hasSystem });
    if (user.isOnboarded && currentStep !== OnboardingStep.systemSettings) {
      return redirect({
        to: `/onboarding/${currentStep}`,
      });
    }
    return { currentStep, user, hasSystem };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current base currency setting
  const { data: currentBaseCurrency } = useQuery({
    ...orpc.settings.read.queryOptions({
      input: { key: "BASE_CURRENCY" },
    }),
    retry: false,
    throwOnError: false,
  });

  // Mutation for updating base currency
  const upsertSettingMutation = useMutation({
    ...orpc.settings.upsert.mutationOptions(),
    onSuccess: async () => {
      logger.debug("Settings mutation successful, invalidating queries");
      await queryClient.invalidateQueries({
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

  const { mutateAsync: upsertSetting, isPending: isUpsertPending } =
    upsertSettingMutation;

  const form = useForm({
    defaultValues: {
      baseCurrency: currentBaseCurrency
        ? (currentBaseCurrency as FiatCurrency)
        : ("USD" as FiatCurrency),
    },
  });

  const handleNext = useCallback(() => {
    logger.debug("Navigating to next step:", OnboardingStep.systemAssets);
    logger.debug(
      "Navigation target:",
      `/onboarding/${OnboardingStep.systemAssets}`
    );

    const navigationPromise = navigate({
      to: `/onboarding/${OnboardingStep.systemAssets}`,
    });

    logger.debug("Navigation promise created:", navigationPromise);

    navigationPromise
      .then(() => {
        logger.debug("Navigation successful");
      })
      .catch((error: unknown) => {
        logger.error("Navigation failed:", error);
      });
  }, [navigate]);

  const handleSaveAndContinue = useCallback(async () => {
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
      handleNext();
    } catch (error) {
      logger.error("Failed to save base currency:", error);
      toast.error("Failed to save platform settings");
    }
  }, [form.state, upsertSetting, handleNext]);

  const handlePrevious = useCallback(() => {
    void navigate({
      to: `/onboarding/${OnboardingStep.systemDeploy}`,
      search: { from: OnboardingStep.systemSettings },
    });
  }, [navigate]);

  return (
    <OnboardingLayout currentStep={OnboardingStep.systemSettings}>
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
                  onClick={handlePrevious}
                  disabled={isUpsertPending}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    void handleSaveAndContinue();
                  }}
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
    </OnboardingLayout>
  );
}
