"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/lib/api/client";
import type { ApplicationSetupStatus } from "@/lib/queries/application-setup/application-setup-schema";
import type { EdenWS } from "@elysiajs/eden/treaty";
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
    let subscription: EdenWS | undefined = undefined;
    const fetchStatus = async () => {
      const statusChanges =
        apiClient.api["application-setup"].ws.status.subscribe();
      subscription = statusChanges.subscribe((message) => {
        if (isError(message.data)) {
          setError(message.data.error);
        } else {
          setStatus(message.data);
        }
      });
      subscription.on("error", (event) => {
        if (event.type === "close") {
          return;
        }
        setError(`Websocket connection error: ${JSON.stringify(event)}`);
      });
    };
    // Wait 1 second before fetching the status
    const timeout = window.setTimeout(fetchStatus, 1000);
    return () => {
      subscription?.close();
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
            <p>
              {status.deployedContracts
                .map((contract) => contract.abiName)
                .join(", ")}
            </p>
          </div>
        )}
      </div>
    </StepContent>
  );
}

function isError(message: unknown): message is { error: string } {
  return typeof message === "object" && message !== null && "error" in message;
}
