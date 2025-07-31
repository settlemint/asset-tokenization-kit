import {
  FormStepContent,
  FormStepHeader,
  FormStepSubmit,
  FormStepSubtitle,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";

export function OnboardingStepLayout({
  title,
  description,
  actions,
  children,
  fullWidth = false,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <>
      <FormStepHeader>
        <FormStepTitle>{title}</FormStepTitle>
        <FormStepSubtitle>{description}</FormStepSubtitle>
      </FormStepHeader>
      <FormStepContent fullWidth={fullWidth}>{children}</FormStepContent>
      {actions && <FormStepSubmit>{actions}</FormStepSubmit>}
    </>
  );
}
