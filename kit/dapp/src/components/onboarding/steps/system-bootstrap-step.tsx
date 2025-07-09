import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { StepComponentProps } from "@/components/multistep-form/types";
import type { SessionUser } from "@/lib/auth";
import { toast } from "sonner";

interface SystemBootstrapStepProps extends StepComponentProps {
  user?: SessionUser;
}

export function SystemBootstrapStep({
  form,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: SystemBootstrapStepProps) {
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const handleNext = useCallback(() => {
    if (isBootstrapped) {
      onNext();
    } else {
      setIsBootstrapped(true);
      setTimeout(() => onNext(), 1000);
    }
  }, [isBootstrapped, onNext]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Bootstrap System</h2>
        <p className="text-sm text-muted-foreground pt-2">
          Initialize the blockchain system and set your platform's base currency
        </p>
      </div>

      <div className="flex-1">
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              System Bootstrap
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This will initialize your blockchain platform with core smart contracts.
            </p>
          </div>

          {isBootstrapped && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                System Bootstrapped Successfully
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          <Button onClick={handleNext}>
            {isBootstrapped ? "Select Assets" : "Bootstrap System"}
          </Button>
        </div>
      </div>
    </div>
  );
}
