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

// TODO: This needs to prefer "step" over the current step, so the sidebar changes when navigating manually (back)
// TODO: The responsive nature of the inline modal is not working well, it constantly overflows the screen
// TODO: Make sure all text is translated
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
        title: "Recovery Codes",
        description: "Save your wallet recovery codes",
      },
      [OnboardingStep.systemDeploy]: {
        title: "Deploy System",
        description: "Deploy the blockchain system",
      },
      [OnboardingStep.systemSettings]: {
        title: "Configure Settings",
        description: "Set up platform settings",
      },
      [OnboardingStep.systemAssets]: {
        title: "Select Assets",
        description: "Choose supported asset types",
      },
      [OnboardingStep.systemAddons]: {
        title: "Enable Addons",
        description: "Configure platform addons",
      },
      [OnboardingStep.identitySetup]: {
        title: t("steps.identity-setup.title"),
        description: t("steps.identity-setup.description"),
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
        title: "Deploy SMART System",
        description: "Set up your blockchain platform",
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
          defaultExpanded: currentStep === step.step,
        });
      } else {
        existingGroup.defaultExpanded = currentStep === step.step;
      }
      return acc;
    }, []);
  }, [steps, groupTranslationMappings, currentStep]);

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
    const activeStep = withTranslations.find((step) => step.id === currentStep);
    if (activeStep) {
      activeStep.component = () => <Outlet />;
    }

    return withTranslations;
  }, [currentStep, steps, stepTranslationMappings]);

  const defaultStepIndex = useMemo(() => {
    const index = stepsWithTranslations.findIndex(
      (step) => step.id === currentStep
    );
    // Ensure we never return -1, fallback to 0 if step not found
    return index >= 0 ? index : 0;
  }, [stepsWithTranslations, currentStep]);

  const onComplete = useCallback(() => {
    logger.info("completed");
  }, []);

  return (
    <MultiStepWizard
      name="onboarding"
      title="Let's get you set up!"
      description="We'll set up your wallet and will configure your identity on the blockchain to use this platform."
      steps={stepsWithTranslations}
      groups={groups}
      onComplete={onComplete}
      defaultStepIndex={defaultStepIndex}
    />
  );
}
