import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import type { UseMultiStepWizardStateOptions, WizardState } from "./types";

const logger = createLogger();

const wizardStateSchema = z.object({
  currentStepIndex: z.number().min(0).default(0),
  completedSteps: z.array(z.string()).default([]),
  stepErrors: z.record(z.string(), z.string()).default({}),
});

type ParsedWizardState = z.infer<typeof wizardStateSchema>;

export function useMultiStepWizardState({
  name,
  enableUrlPersistence = true,
  debounceMs = 300,
  defaultState = {},
}: UseMultiStepWizardStateOptions) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  // Parse URL parameters with the wizard name as prefix
  const parseUrlState = useCallback((): ParsedWizardState => {
    if (!enableUrlPersistence) {
      return {
        currentStepIndex: defaultState.currentStepIndex ?? 0,
        completedSteps: defaultState.completedSteps ?? [],
        stepErrors: defaultState.stepErrors ?? {},
      };
    }

    try {
      const wizardSearch = search[name] as Record<string, unknown> | undefined;
      if (!wizardSearch) {
        return {
          currentStepIndex: defaultState.currentStepIndex ?? 0,
          completedSteps: defaultState.completedSteps ?? [],
          stepErrors: defaultState.stepErrors ?? {},
        };
      }

      // Parse the wizard state from URL
      const urlState = {
        currentStepIndex: wizardSearch.step
          ? Number(wizardSearch.step)
          : (defaultState.currentStepIndex ?? 0),
        completedSteps: wizardSearch.completed
          ? (wizardSearch.completed as string).split(",").filter(Boolean)
          : (defaultState.completedSteps ?? []),
        stepErrors: wizardSearch.errors
          ? JSON.parse(wizardSearch.errors as string)
          : (defaultState.stepErrors ?? {}),
      };

      return wizardStateSchema.parse(urlState);
    } catch (error) {
      logger.error("Failed to parse wizard URL state", { error, name });
      return {
        currentStepIndex: defaultState.currentStepIndex ?? 0,
        completedSteps: defaultState.completedSteps ?? [],
        stepErrors: defaultState.stepErrors ?? {},
      };
    }
  }, [search, name, enableUrlPersistence, defaultState]);

  const state = useMemo(() => parseUrlState(), [parseUrlState]);

  // Update URL with debouncing
  const updateUrl = useDebouncedCallback(
    useCallback(
      (newState: Partial<WizardState>) => {
        if (!enableUrlPersistence) return;

        const updatedState = { ...state, ...newState };

        // Build the wizard-specific search params
        const wizardParams: Record<string, unknown> = {};

        if (updatedState.currentStepIndex > 0) {
          wizardParams.step = updatedState.currentStepIndex;
        }

        if (updatedState.completedSteps.length > 0) {
          wizardParams.completed = updatedState.completedSteps.join(",");
        }

        if (Object.keys(updatedState.stepErrors).length > 0) {
          wizardParams.errors = JSON.stringify(updatedState.stepErrors);
        }

        // Build the complete search params object
        const newSearchParams = {
          ...search,
          [name]:
            Object.keys(wizardParams).length > 0 ? wizardParams : undefined,
        };

        // Navigate with new search params
        // Note: Using 'as never' here due to TanStack Router's complex generic types
        // This follows the same pattern as data-table implementation
        void navigate({
          search: newSearchParams as never,
          replace: true,
        });
      },
      [navigate, name, enableUrlPersistence, state, search]
    ),
    debounceMs
  );

  // State setters
  const setCurrentStepIndex = useCallback(
    (stepIndex: number) => {
      updateUrl({ currentStepIndex: stepIndex });
    },
    [updateUrl]
  );

  const setCompletedSteps = useCallback(
    (completedSteps: string[]) => {
      updateUrl({ completedSteps });
    },
    [updateUrl]
  );

  const setStepErrors = useCallback(
    (stepErrors: Record<string, string>) => {
      updateUrl({ stepErrors });
    },
    [updateUrl]
  );

  const reset = useCallback(() => {
    if (enableUrlPersistence) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _unused, ...rest } = search;
      // Note: Using 'as never' here due to TanStack Router's complex generic types
      void navigate({
        search: rest as never,
        replace: true,
      });
    }
  }, [navigate, name, enableUrlPersistence, search]);

  return {
    currentStepIndex: state.currentStepIndex,
    completedSteps: state.completedSteps,
    stepErrors: state.stepErrors,
    setCurrentStepIndex,
    setCompletedSteps,
    setStepErrors,
    reset,
    wizardOptions: {
      currentStepIndex: state.currentStepIndex,
      completedSteps: state.completedSteps,
      stepErrors: state.stepErrors,
    },
  };
}
