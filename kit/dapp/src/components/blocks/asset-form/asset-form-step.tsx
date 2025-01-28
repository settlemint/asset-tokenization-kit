import type { PropsWithChildren } from 'react';

export type AssetFormStepProps = {
  title: string;
};

export function AssetFormStep({ children, title }: PropsWithChildren<AssetFormStepProps>) {
  return (
    <div>
      <h3 className="pt-[1.5rem] font-bold">{title}</h3>
      {children}
    </div>
  );
}
