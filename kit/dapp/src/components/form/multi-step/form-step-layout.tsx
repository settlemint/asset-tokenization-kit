import {
  FormStepContent,
  FormStepHeader,
  FormStepSubmit,
  FormStepSubtitle,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";

export function FormStepLayout({
  title,
  description,
  actions,
  children,
  fullWidth = false,
  asGrid = false,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  asGrid?: boolean;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto h-[calc(100%-3rem)]">
        <FormStepHeader>
          <FormStepTitle>{title}</FormStepTitle>
          <FormStepSubtitle>{description}</FormStepSubtitle>
        </FormStepHeader>
        <FormStepContent fullWidth={fullWidth} asGrid={asGrid}>
          {children}
        </FormStepContent>
      </div>
      {actions && <FormStepSubmit>{actions}</FormStepSubmit>}
    </>
  );
}
