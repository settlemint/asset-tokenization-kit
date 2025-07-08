import { createContext, useContext, type ReactNode } from "react";
import type { WizardContextValue } from "./types";

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider<TFormData = unknown>({
  children,
  value,
}: {
  children: ReactNode;
  value: WizardContextValue<TFormData>;
}) {
  return (
    <WizardContext.Provider value={value as WizardContextValue}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizardContext<TFormData = unknown>() {
  const context = useContext(
    WizardContext
  ) as WizardContextValue<TFormData> | null;
  if (!context) {
    console.error(
      "useWizardContext: No context found - must be used within a WizardProvider"
    );
    throw new Error("useWizardContext must be used within a WizardProvider");
  }

  // Additional validation
  if (!Array.isArray(context.steps)) {
    console.error("useWizardContext: Invalid steps in context", {
      hasSteps: !!context.steps,
      stepsType: typeof context.steps,
      isArray: Array.isArray(context.steps),
    });
    throw new Error("Invalid wizard context: steps must be an array");
  }

  return context;
}
