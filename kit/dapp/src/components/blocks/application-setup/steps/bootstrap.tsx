"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { apiClient } from "@/lib/api/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { Address } from "viem";

interface BootstrapStepProps {
  onNext: () => void;
}

export function BootstrapStep({ onNext }: BootstrapStepProps) {
  const t = useTranslations("admin.application-setup");

  const [status, setStatus] = useState<{
    address: Address;
    createdAt: Date;
    abiName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const statusChanges =
        apiClient.api["application-setup"].status.subscribe();
      statusChanges.subscribe((message) => {
        if (isError(message.data)) {
          setError(message.data.error);
        } else {
          setStatus(message.data);
        }
      });
    };
    fetchStatus();
  }, []);

  return (
    <StepContent onNext={onNext} centerContent={true} isNextDisabled={true}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("bootstrap.title")}</h2>
        </div>
        {status && (
          <div className="flex flex-col gap-2">
            <p>{status.address}</p>
            <p>{status.abiName}</p>
          </div>
        )}
      </div>
    </StepContent>
  );
}

function isError(message: unknown): message is { error: string } {
  return typeof message === "object" && message !== null && "error" in message;
}
