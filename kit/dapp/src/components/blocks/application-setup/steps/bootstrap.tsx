"use client";

import { StepContent } from "@/components/blocks/step-wizard/step-content";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/lib/api/client";
import {
  ApplicationSetupStatusSchema,
  type ApplicationSetupStatus,
} from "@/lib/queries/application-setup/application-setup-schema";
import { safeParse } from "@/lib/utils/typebox";
import { tryParseJson } from "@settlemint/sdk-utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface BootstrapStepProps {
  onNext: () => void;
}

export function BootstrapStep({ onNext }: BootstrapStepProps) {
  const t = useTranslations("admin.application-setup");

  const [status, setStatus] = useState<ApplicationSetupStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } =
        await apiClient.api["application-setup"].stream.status.get();
      if (error) {
        setError(
          typeof error?.value === "string" ? error.value : "Unknown error"
        );
        return;
      }
      for await (const statusUpdate of data) {
        const parsedStatusUpdate =
          typeof statusUpdate === "string"
            ? tryParseJson(statusUpdate)
            : statusUpdate;
        if (statusUpdate === undefined || statusUpdate === null) {
          continue;
        }
        if (isError(parsedStatusUpdate)) {
          setError(parsedStatusUpdate.error);
          return;
        } else {
          try {
            const status = safeParse(
              ApplicationSetupStatusSchema,
              parsedStatusUpdate
            );
            setStatus(status);
            if (status.isSetup) {
              return;
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
      debugger;
    };
    // Wait 1 second before fetching the status
    const timeout = window.setTimeout(fetchStatus, 1000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <StepContent onNext={onNext} centerContent={true} isNextDisabled={true}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t("bootstrap.title")}</h2>
        </div>
        {error && (
          <Alert
            variant="destructive"
            className="mb-4 border-destructive text-destructive"
          >
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        {status && (
          <div className="flex flex-col gap-2">
            <p>{status.isSetup ? "Setup" : "Not setup"}</p>
            <ul>
              {status.contractStatus.map((contract) => (
                <li key={contract.name}>
                  <p>{contract.name}</p>
                  <p>{contract.status}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </StepContent>
  );
}

function isError(message: unknown): message is { error: string } {
  return typeof message === "object" && message !== null && "error" in message;
}
