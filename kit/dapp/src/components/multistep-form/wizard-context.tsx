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
  const context = useContext(WizardContext) as WizardContextValue<TFormData> | null;
  if (!context) {
    throw new Error("useWizardContext must be used within a WizardProvider");
  }
  return context;
}