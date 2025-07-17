import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { CheckCircle, Shield } from "lucide-react";

interface SecuritySuccessProps {
  onNext: () => void;
  hideButtons?: boolean;
}

export function SecuritySuccess({
  onNext,
  hideButtons = false,
}: SecuritySuccessProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const isPincodeSet = Boolean(user?.pincodeEnabled);
  const isOtpEnabled = Boolean(user?.twoFactorEnabled);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>

      {!hideButtons && (
        <div className="mt-8 pt-6 border-t border-border">
          <footer className="flex justify-end">
            <Button onClick={onNext}>Continue</Button>
          </footer>
        </div>
      )}
    </div>
  );
}
