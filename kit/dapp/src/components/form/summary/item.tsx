"use client";

import type { ReactNode } from "react";

import { SecretItem } from "./secret-item";

interface FormSummaryDetailItemProps {
  label: ReactNode;
  value: ReactNode;
  secret?: boolean;
}

export function FormSummaryDetailItem({
  label,
  value,
  secret = false,
}: FormSummaryDetailItemProps) {
  return (
    <div className="flex justify-between py-1.5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-medium text-sm">
        {secret ? <SecretItem value={value} /> : value}
      </dd>
    </div>
  );
}
