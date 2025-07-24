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
      <div className="OnboardingStepLayout flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground pt-2">{description}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className={`${fullWidth ? "" : "max-w-3xl"} space-y-6 pr-2`}>
          {children}
        </div>
      </div>
      {actions && (
        <footer className="OnboardingStepLayout__footer absolute bottom-8 left-8 right-8 mt-6">
          {actions}
        </footer>
      )}
    </>
  );
}
