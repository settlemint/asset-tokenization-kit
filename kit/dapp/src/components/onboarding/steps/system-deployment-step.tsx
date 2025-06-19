import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function SystemDeploymentStep() {
  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );
  const { t } = useTranslation(["onboarding", "general"]);
  const [, setSystemAddress] = useSettings("SYSTEM_ADDRESS");

  const {
    mutate: createSystem,
    isPending: isCreatingSystem,
    isTracking,
  } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions(),
    onSuccess: (data) => {
      setSystemAddress(data);
    },
  });

  return (
    <Button
      disabled={!!systemAddress || isCreatingSystem || isTracking}
      onClick={() => {
        createSystem({
          messages: {
            systemCreated: t(
              "onboarding:create-system-messages.system-created"
            ),
            creatingSystem: t(
              "onboarding:create-system-messages.creating-system"
            ),
            systemCreationFailed: t(
              "onboarding:create-system-messages.system-creation-failed"
            ),
            streamTimeout: t(
              "onboarding:create-system-messages.transaction-tracking.stream-timeout"
            ),
            waitingForMining: t(
              "onboarding:create-system-messages.transaction-tracking.waiting-for-mining"
            ),
            transactionFailed: t(
              "onboarding:create-system-messages.transaction-tracking.transaction-failed"
            ),
            transactionDropped: t(
              "onboarding:create-system-messages.transaction-tracking.transaction-dropped"
            ),
            waitingForIndexing: t(
              "onboarding:create-system-messages.transaction-tracking.waiting-for-indexing"
            ),
            transactionIndexed: t(
              "onboarding:create-system-messages.transaction-tracking.transaction-indexed"
            ),
            indexingTimeout: t(
              "onboarding:create-system-messages.transaction-tracking.indexing-timeout"
            ),
          },
        });
      }}
    >
      {isCreatingSystem || isTracking
        ? t("create-system-messages.button.deploying")
        : t("create-system-messages.button.deploy")}
    </Button>
  );
}
