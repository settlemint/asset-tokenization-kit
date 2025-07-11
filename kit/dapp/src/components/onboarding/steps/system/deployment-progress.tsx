import { Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DeploymentStep {
  id: string;
  label: string;
  completed: boolean;
  inProgress: boolean;
}

interface DeploymentProgressProps {
  onComplete?: () => void;
}

export function DeploymentProgress({ onComplete }: DeploymentProgressProps) {
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    {
      id: "core",
      label: "Core System Deployed",
      completed: true,
      inProgress: false,
    },
    {
      id: "identity",
      label: "Deploying Identity Registry...",
      completed: false,
      inProgress: true,
    },
    {
      id: "compliance",
      label: "Deploying Compliance Engine...",
      completed: false,
      inProgress: false,
    },
    {
      id: "trusted",
      label: "Deploying Trusted Issuers Registry...",
      completed: false,
      inProgress: false,
    },
    {
      id: "modules",
      label: "Register compliance modules...",
      completed: false,
      inProgress: false,
    },
  ]);

  // Function to simulate deployment progress steps
  const simulateDeploymentProgress = useCallback(() => {
    // Simulate step progression
    const stepTimings = [
      { step: "identity", delay: 2000 },
      { step: "compliance", delay: 4000 },
      { step: "trusted", delay: 6000 },
      { step: "modules", delay: 8000 },
    ];

    stepTimings.forEach(({ step, delay }) => {
      setTimeout(() => {
        setDeploymentSteps((prev) =>
          prev.map((s) => {
            if (s.id === step) {
              return { ...s, completed: true, inProgress: false };
            }
            // Set next step as in progress
            const currentIndex = prev.findIndex((item) => item.id === step);
            const nextStep = prev[currentIndex + 1];
            if (nextStep && !nextStep.completed) {
              if (s.id === nextStep.id) {
                return { ...s, inProgress: true };
              }
            }
            return s;
          })
        );
      }, delay);
    });

    // Complete final step after 10 seconds total
    setTimeout(() => {
      setDeploymentSteps((prev) =>
        prev.map((s) => ({ ...s, completed: true, inProgress: false }))
      );
      onComplete?.();
    }, 10000);
  }, [onComplete]);

  useEffect(() => {
    simulateDeploymentProgress();
  }, [simulateDeploymentProgress]);

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
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <div className="flex-shrink-0">
              {step.completed ? (
                <div className="w-8 h-8 rounded-full bg-sm-state-success flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
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
                    : step.inProgress
                      ? "text-primary"
                      : "text-muted-foreground"
                }`}
              >
                {step.completed
                  ? step.label
                      .replace("Deploying", "Deployed")
                      .replace("...", "")
                  : step.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Deployment in progress...
        </div>
      </div>
    </div>
  );
}
