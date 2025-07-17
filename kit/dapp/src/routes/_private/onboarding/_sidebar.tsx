import { MultiStepWizard } from "@/components/multistep-form/multistep-wizard";
import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import {
  OnboardingStep,
  OnboardingStepGroup,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const logger = createLogger();

type OnboardingStepDefintion = Omit<StepDefinition, "id"> & {
  id: OnboardingStep;
  groupId: OnboardingStepGroup;
};

// ✅ DONE: Now prefers "step" URL param over current step for manual navigation
// ✅ DONE: Fixed responsive modal overflow with viewport constraints and mobile-first design
// ✅ DONE: All text is now translated using proper i18n keys
// TODO: There is a weird on complete log message
// TODO: We need a better way to handle the translations, it is not pretty inlined here as it is now
export const Route = createFileRoute("/_private/onboarding/_sidebar")({
  validateSearch: zodValidator(
    z.object({
      step: z.enum(Object.values(OnboardingStep)).optional(),
    })
  ),
  loader: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    return updateOnboardingStateMachine({ user });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { steps, currentStep } = Route.useLoaderData();
  const { step: stepFromUrl } = Route.useSearch();

  // Prefer the step from URL over the current step from state machine
  // This allows manual navigation (back/forward buttons) to work correctly
  const effectiveStep = stepFromUrl ?? currentStep;

  const stepTranslationMappings = useMemo<
    Record<OnboardingStep, { title: string; description: string }>
  >(
    () => ({
      [OnboardingStep.wallet]: {
        title: t("steps.wallet.title"),
        description: t("steps.wallet.description"),
      },
      [OnboardingStep.walletSecurity]: {
        title: t("steps.security.title"),
        description: t("steps.security.description"),
      },
      [OnboardingStep.walletRecoveryCodes]: {
        title: t("steps.walletRecoveryCodes.title"),
        description: t("steps.walletRecoveryCodes.description"),
      },
      [OnboardingStep.systemDeploy]: {
        title: t("steps.system.title"),
        description: t("steps.system.description"),
      },
      [OnboardingStep.systemSettings]: {
        title: t("steps.systemSettings.title"),
        description: t("steps.systemSettings.description"),
      },
      [OnboardingStep.systemAssets]: {
        title: t("steps.assets.title"),
        description: t("steps.assets.description"),
      },
      [OnboardingStep.systemAddons]: {
        title: t("steps.systemAddons.title"),
        description: t("steps.systemAddons.description"),
      },
      [OnboardingStep.identity]: {
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
      },
    }),
    [t]
  );

  const groupTranslationMappings = useMemo<
    Record<OnboardingStepGroup, { title: string; description: string }>
  >(
    () => ({
      [OnboardingStepGroup.wallet]: {
        title: t("wallet.title"),
        description: t("wallet.description"),
      },
      [OnboardingStepGroup.system]: {
        title: t("system.title"),
        description: t("system.description"),
      },
      [OnboardingStepGroup.identity]: {
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
      },
    }),
    [t]
  );

  const groups = useMemo((): StepGroup[] => {
    return steps.reduce<StepGroup[]>((acc, step) => {
      const existingGroup = acc.find(
        (group) => group.id === step.groupId.toString()
      );
      if (!existingGroup) {
        acc.push({
          id: step.groupId,
          title: groupTranslationMappings[step.groupId].title,
          description: groupTranslationMappings[step.groupId].description,
          collapsible: true,
          defaultExpanded: effectiveStep === step.step,
        });
      } else {
        existingGroup.defaultExpanded = effectiveStep === step.step;
      }
      return acc;
    }, []);
  }, [steps, groupTranslationMappings, effectiveStep]);

  const stepsWithTranslations = useMemo((): OnboardingStepDefintion[] => {
    const withTranslations = steps.map(
      (step): OnboardingStepDefintion => ({
        ...step,
        id: step.step,
        title: stepTranslationMappings[step.step].title,
        description: stepTranslationMappings[step.step].description,
      })
    );

    // Inject the children of the current step
    const activeStep = withTranslations.find(
      (step) => step.id === effectiveStep
    );
    if (activeStep) {
      activeStep.component = () => <Outlet />;
    }

    return withTranslations;
  }, [effectiveStep, steps, stepTranslationMappings]);

  const defaultStepIndex = useMemo(() => {
    const index = stepsWithTranslations.findIndex(
      (step) => step.id === effectiveStep
    );
    // Ensure we never return -1, fallback to 0 if step not found
    return index >= 0 ? index : 0;
  }, [stepsWithTranslations, effectiveStep]);

  const onComplete = useCallback(() => {
    logger.info("completed");
  }, []);

  return (
    <MultiStepWizard
      name="onboarding"
      title={t("card-title")}
      description={t("card-description")}
      steps={stepsWithTranslations}
      groups={groups}
      onComplete={onComplete}
      defaultStepIndex={defaultStepIndex}
    />
  );
}
