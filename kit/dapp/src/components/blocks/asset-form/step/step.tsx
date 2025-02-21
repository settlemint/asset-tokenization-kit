import type { PropsWithChildren } from 'react';

interface AssetFormStepProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function AssetFormStep({ title, description, children }: AssetFormStepProps) {
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
