import type { ComponentPropsWithoutRef } from 'react';

export function AssetIcon({ className, value, ...props }: ComponentPropsWithoutRef<'svg'> & { value: string }) {
  return (
    <svg
      viewBox="0 0 34 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '26px',
        height: '25px',
      }}
      aria-label="Asset Icon"
      {...props}
    >
      <title>Asset Icon</title>
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1" />
      <text
        x="16"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        className="font-bold text-[13px]"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </svg>
  );
}
