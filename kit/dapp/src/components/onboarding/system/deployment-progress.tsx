import { Button } from "@/components/ui/button";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DeploymentStep {
  id: string;
  label: string;
  completed: boolean;
  inProgress: boolean;
}

interface DeploymentProgressProps {
  onComplete?: () => void;
  currentMessage?: string | null;
  hasError?: boolean;
  onRetry?: () => void;
}

export function DeploymentProgress({
  onComplete,
  currentMessage,
  hasError,
  onRetry,
}: DeploymentProgressProps) {
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    {
      id: "creating",
      label: "Creating system...",
      completed: false,
      inProgress: true,
    },
    {
      id: "mining",
      label: "Waiting for transaction to be mined...",
      completed: false,
      inProgress: false,
    },
    {
      id: "indexing",
      label: "Waiting for indexing...",
      completed: false,
      inProgress: false,
    },
    {
      id: "bootstrapping",
      label: "Bootstrapping system...",
      completed: false,
      inProgress: false,
    },
    {
      id: "complete",
      label: "System created successfully",
      completed: false,
      inProgress: false,
    },
  ]);

  const [showRetryButton, setShowRetryButton] = useState(false);

  // Update steps based on current streaming message
  const updateStepsFromMessage = useCallback(
    (message: string | null) => {
      if (!message) return;

      setDeploymentSteps((prev) => {
        const newSteps = [...prev];

        // Map messages to steps
        if (message.includes("Creating system")) {
          // Creating system step is in progress
          if (newSteps[0]) {
            newSteps[0].inProgress = true;
            newSteps[0].completed = false;
          }
          for (let i = 1; i < newSteps.length; i++) {
            const step = newSteps[i];
            if (step) {
              step.inProgress = false;
              step.completed = false;
            }
          }
        } else if (message.includes("Waiting for transaction to be mined")) {
          // Mining step is in progress
          if (newSteps[0]) {
            newSteps[0].inProgress = false;
            newSteps[0].completed = true;
          }
          if (newSteps[1]) {
            newSteps[1].inProgress = true;
            newSteps[1].completed = false;
          }
          for (let i = 2; i < newSteps.length; i++) {
            const step = newSteps[i];
            if (step) {
              step.inProgress = false;
              step.completed = false;
            }
          }
        } else if (message.includes("Waiting for indexing")) {
          // Indexing step is in progress
          if (newSteps[0]) {
            newSteps[0].inProgress = false;
            newSteps[0].completed = true;
          }
          if (newSteps[1]) {
            newSteps[1].inProgress = false;
            newSteps[1].completed = true;
          }
          if (newSteps[2]) {
            newSteps[2].inProgress = true;
            newSteps[2].completed = false;
          }
          for (let i = 3; i < newSteps.length; i++) {
            const step = newSteps[i];
            if (step) {
              step.inProgress = false;
              step.completed = false;
            }
          }
        } else if (message.includes("Bootstrapping system")) {
          // Bootstrapping step is in progress
          if (newSteps[0]) {
            newSteps[0].inProgress = false;
            newSteps[0].completed = true;
          }
          if (newSteps[1]) {
            newSteps[1].inProgress = false;
            newSteps[1].completed = true;
          }
          if (newSteps[2]) {
            newSteps[2].inProgress = false;
            newSteps[2].completed = true;
          }
          if (newSteps[3]) {
            newSteps[3].inProgress = true;
            newSteps[3].completed = false;
          }
          if (newSteps[4]) {
            newSteps[4].inProgress = false;
            newSteps[4].completed = false;
          }
        } else if (message.includes("System created successfully")) {
          // All steps completed
          newSteps.forEach((step) => {
            step.inProgress = false;
            step.completed = true;
          });
          onComplete?.();
        }

        return newSteps;
      });
    },
    [onComplete]
  );

  // Handle error state - show retry button if indexing fails
  useEffect(() => {
    if (hasError && currentMessage?.includes("Waiting for indexing")) {
      setShowRetryButton(true);
      // Mark indexing step as failed
      setDeploymentSteps((prev) => {
        const newSteps = [...prev];
        if (newSteps[2]) {
          newSteps[2].inProgress = false;
          newSteps[2].completed = false;
        }
        return newSteps;
      });
    } else {
      setShowRetryButton(false);
    }
  }, [hasError, currentMessage]);

  useEffect(() => {
    updateStepsFromMessage(currentMessage ?? null);
  }, [currentMessage, updateStepsFromMessage]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Deploying System Components</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we set up your blockchain infrastructure. This may
          take a few minutes.
        </p>
      </div>

      <div className="space-y-4">
        {deploymentSteps.map((step, index) => {
          const isIndexingWithError =
            step.id === "indexing" && hasError && showRetryButton;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${
                isIndexingWithError
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  : ""
              }`}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <div className="w-8 h-8 rounded-full bg-sm-state-success flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : isIndexingWithError ? (
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <TriangleAlert className="w-4 h-4 text-white" />
                  </div>
                ) : step.inProgress ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted border border-input flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.completed
                      ? "text-sm-state-success"
                      : isIndexingWithError
                        ? "text-red-700 dark:text-red-300"
                        : step.inProgress
                          ? "text-primary"
                          : "text-muted-foreground"
                  }`}
                >
                  {isIndexingWithError
                    ? "Indexing timeout - please retry"
                    : step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showRetryButton ? (
        <div className="text-center space-y-4">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              The system deployment is waiting for blockchain indexing to
              complete. This sometimes takes longer than expected due to network
              conditions.
            </p>
          </div>
          <Button onClick={onRetry} className="w-full">
            Retry Indexing
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {currentMessage ?? "Deployment in progress..."}
          </div>
        </div>
      )}
    </div>
  );
}
