import type { ReactNode } from 'react';

interface OgDataBoxProps {
  label: ReactNode;
  value: ReactNode;
}

export function OgDataBox({ label, value }: OgDataBoxProps) {
  return (
    <div tw="flex flex-col p-8 rounded-2xl border-4 border-white/30 bg-white/5 ml-4">
      <dt tw="text-2xl text-slate-300">{label}</dt>
      <dd tw="text-4xl font-bold text-white mt-2 capitalize">{value}</dd>
    </div>
  );
}
