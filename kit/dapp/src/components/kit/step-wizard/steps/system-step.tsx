import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { useTranslation } from "react-i18next";

interface SystemStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orpc: any;
  onComplete: () => void;
}

export function SystemStep({ orpc, onComplete }: SystemStepProps) {
  const { t } = useTranslation(["onboarding", "general"]);
  const [, setSystemAddress] = useSettings("SYSTEM_ADDRESS");

  const {
    mutate: createSystem,
    isPending: isCreatingSystem,
    isTracking,
  } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions({
      onSuccess: (data: string) => {
        setSystemAddress(data);
        onComplete();
      },
    }),
    messages: {
      initialLoading: t("onboarding:messages.pending.mining"),
      noResultError: t("onboarding:messages.error"),
      defaultError: t("onboarding:messages.error"),
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
              <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
              <line x1="6" x2="6.01" y1="6" y2="6" />
              <line x1="6" x2="6.01" y1="18" y2="18" />
            </svg>
          </div>
          {t("onboarding:system-step-title", "Deploy SMART System")}
        </CardTitle>
        <CardDescription>
          {t(
            "onboarding:system-step-description",
            "Deploy your blockchain infrastructure for asset tokenization"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">
            {t("onboarding:what-is-smart-system", "What is a SMART system?")}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t(
              "onboarding:smart-system-explanation",
              "SMART System is SettleMint's comprehensive blockchain system that enables compliant asset tokenization with built-in identity management and regulatory compliance."
            )}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-600 dark:text-amber-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t("onboarding:system-deployment-info", "System deployment")}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {t(
                    "onboarding:system-deployment-time",
                    "This process may take 2-3 minutes to complete"
                  )}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              createSystem();
            }}
            disabled={isCreatingSystem || isTracking}
            size="lg"
            className="w-full"
          >
            {isCreatingSystem || isTracking
              ? "Deploying system..."
              : "Deploy SMART system"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
