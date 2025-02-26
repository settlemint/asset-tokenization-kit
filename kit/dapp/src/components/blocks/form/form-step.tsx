import type { PropsWithChildren } from 'react';

interface FormStepProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function FormStep({ title, description, children }: FormStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      {children}
    </div>
  );
}
