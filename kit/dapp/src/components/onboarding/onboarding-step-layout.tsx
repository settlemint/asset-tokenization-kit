export function OnboardingStepLayout({
  title,
  description,
  actions,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground pt-2">{description}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-6 pr-2">{children}</div>
      </div>
      {actions && (
        <footer className="max-w-3xl mt-6 border-t border-border pt-4">
          {actions}
        </footer>
      )}
    </>
  );
}
