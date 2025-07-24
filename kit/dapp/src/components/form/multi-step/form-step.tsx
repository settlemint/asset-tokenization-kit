import { type PropsWithChildren } from "react";

export function FormStep({ children }: PropsWithChildren) {
  return <div className="flex flex-col h-full space-y-6">{children}</div>;
}

export function FormStepTitle({ children }: PropsWithChildren) {
  return <h2 className="text-2xl font-semibold tracking-tight">{children}</h2>;
}

export function FormStepSubtitle({ children }: PropsWithChildren) {
  return <div className="text-sm font-medium tracking-tight">{children}</div>;
}

export function FormStepDescription({ children }: PropsWithChildren) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function FormStepContent({ children }: PropsWithChildren) {
  return <div className="flex-1 space-y-6">{children}</div>;
}

export function FormStepSubmit({ children }: PropsWithChildren) {
  return <div className="flex justify-end">{children}</div>;
}

export function FormStepHeader({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-1">{children}</div>;
}
