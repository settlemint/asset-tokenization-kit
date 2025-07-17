import { OnboardingStep } from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function RecoveryCodesComplete() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Recovery Codes Saved</h2>
          <p className="text-sm text-muted-foreground pt-2">
            Your recovery codes have been generated and saved
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl space-y-6 pr-2">
            <div className="space-y-4">
              <p className="text-base text-foreground leading-relaxed">
                Great! You've successfully saved your recovery codes. Keep them
                in a safe place - you'll need them if you ever lose access to
                your security methods.
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <Button
          onClick={async () => {
            await navigate({
              to: `/onboarding/${OnboardingStep.systemDeploy}`,
            });
          }}
        >
          Continue
        </Button>
      </footer>
    </div>
  );
}
