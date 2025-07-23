import { type ReactNode } from "react";

interface FormStepProps {
  children: ReactNode;
}

export function FormStep({ children }: FormStepProps) {
  return <div className="flex flex-col h-full">{children}</div>;
}

interface FormStepTitleProps {
  children: ReactNode;
}

export function FormStepTitle({ children }: FormStepTitleProps) {
  return (
    <h2 className="text-2xl font-semibold leading-none tracking-tight mb-2">
      {children}
    </h2>
  );
}

interface FormStepDescriptionProps {
  children: ReactNode;
}

export function FormStepDescription({ children }: FormStepDescriptionProps) {
  return <p className="text-sm text-muted-foreground mb-6">{children}</p>;
}

interface FormStepContentProps {
  children: ReactNode;
}

export function FormStepContent({ children }: FormStepContentProps) {
  return <div className="flex-1 space-y-6">{children}</div>;
}

interface FormStepSubmitProps {
  children: ReactNode;
}

export function FormStepSubmit({ children }: FormStepSubmitProps) {
  return <div className="flex justify-end pt-4">{children}</div>;
}
