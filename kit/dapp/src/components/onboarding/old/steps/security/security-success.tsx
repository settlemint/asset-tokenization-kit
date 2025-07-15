import { Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecuritySuccessProps {
  isPincodeSet: boolean;
  isOtpEnabled: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onModify: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function SecuritySuccess({
  isPincodeSet,
  isOtpEnabled,
  onNext,
  onPrevious,
  onModify,
  isFirstStep,
  isLastStep,
}: SecuritySuccessProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Success animation */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-sm-state-success/10 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-sm-state-success" />
          </div>
          <div className="absolute -top-1 -right-1">
            <CheckCircle className="w-8 h-8 text-sm-state-success bg-background rounded-full" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Your wallet is now secured!
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isPincodeSet && isOtpEnabled
            ? "You've successfully set up both PIN code and two-factor authentication. Your wallet now has multiple layers of protection."
            : isPincodeSet
              ? "You've successfully set up PIN code protection. Your wallet is now secured with a 6-digit PIN."
              : isOtpEnabled
                ? "You've successfully set up two-factor authentication. Your wallet is now protected with time-based codes."
                : "Your security setup is complete."}
        </p>
      </div>

      {/* Security methods summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-foreground mb-3">
          Active Security Methods:
        </h4>
        <div className="space-y-2">
          {isPincodeSet && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-sm-state-success" />
              <span>PIN Code Protection</span>
            </div>
          )}
          {isOtpEnabled && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-sm-state-success" />
              <span>Two-Factor Authentication</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {!isFirstStep && (
          <Button variant="outline" onClick={onPrevious} className="flex-1">
            Previous
          </Button>
        )}
        <Button variant="outline" onClick={onModify} className="flex-1">
          Modify Security
        </Button>
        <Button onClick={onNext} className="flex-1">
          {isLastStep ? "Finish" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
