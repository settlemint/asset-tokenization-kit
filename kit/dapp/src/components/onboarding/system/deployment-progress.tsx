import { Button } from "@/components/ui/button";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useMemo } from "react";

interface DeploymentStep {
  id: string;
  label: string;
  completed: boolean;
  inProgress: boolean;
  failed?: boolean;
}

interface DeploymentProgressProps {
  onComplete?: () => void;
  currentMessage?: string | null;
  hasError?: boolean;
  onRetry?: () => void;
}

const INITIAL_STEPS: DeploymentStep[] = [
  {
    id: "creating",
    label: "Creating system...",
    completed: false,
    inProgress: false,
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
];

function getStepStateFromMessage(message: string | null): {
  activeStepIndex: number;
  isComplete: boolean;
} {
  if (!message) {
    return { activeStepIndex: 0, isComplete: false };
  }

  if (message.includes("System created successfully")) {
    return { activeStepIndex: -1, isComplete: true };
  }
  if (message.includes("Bootstrapping system")) {
    return { activeStepIndex: 3, isComplete: false };
  }
  if (message.includes("Waiting for indexing")) {
    return { activeStepIndex: 2, isComplete: false };
  }
  if (message.includes("Waiting for transaction to be mined")) {
    return { activeStepIndex: 1, isComplete: false };
  }
  if (message.includes("Creating system")) {
    return { activeStepIndex: 0, isComplete: false };
  }

  return { activeStepIndex: 0, isComplete: false };
}

export function DeploymentProgress({
  onComplete,
  currentMessage,
  hasError,
  onRetry,
}: DeploymentProgressProps) {
  // Derive current state from props
  const { activeStepIndex, isComplete } = getStepStateFromMessage(
    currentMessage ?? null
  );

  const showRetryButton =
    hasError && currentMessage?.includes("Waiting for indexing");

  // Calculate steps based on current state
  const deploymentSteps = useMemo((): DeploymentStep[] => {
    return INITIAL_STEPS.map((step, index) => {
      if (isComplete) {
        return { ...step, completed: true, inProgress: false };
      }

      if (index < activeStepIndex) {
        return { ...step, completed: true, inProgress: false };
      }

      if (index === activeStepIndex) {
        if (step.id === "indexing" && showRetryButton) {
          return { ...step, completed: false, inProgress: false, failed: true };
        }
        return { ...step, completed: false, inProgress: true };
      }

      return { ...step, completed: false, inProgress: false };
    });
  }, [activeStepIndex, isComplete, showRetryButton]);

  // Handle completion as a side effect
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

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
        {deploymentSteps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${
              step.failed
                ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                : ""
            }`}
          >
            <div className="flex-shrink-0">
              {step.completed ? (
                <div className="w-8 h-8 rounded-full bg-sm-state-success flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : step.failed ? (
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
                    : step.failed
                      ? "text-red-700 dark:text-red-300"
                      : step.inProgress
                        ? "text-primary"
                        : "text-muted-foreground"
                }`}
              >
                {step.failed && step.id === "indexing"
                  ? "Indexing timeout - please retry"
                  : step.label}
              </p>
            </div>
          </div>
        ))}
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
