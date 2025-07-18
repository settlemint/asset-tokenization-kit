import { useCallback, useMemo, useState } from "react";

import { authClient } from "@/lib/auth/auth.client";
import { OtpSetupComponent } from "./otp-setup-component";
import { PinSetupComponent } from "./pin-setup-component";
import { SecurityMethodSelector } from "./security-method-selector";
import { SecuritySuccess } from "./security-success";

interface WalletSecurityMainProps {
  onNext: () => void;
}

export function WalletSecurityMain({ onNext }: WalletSecurityMainProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const hasPincode = Boolean(user?.pincodeEnabled);
  const hasTwoFactor = Boolean(user?.twoFactorEnabled);
  const hasAnySecurityMethod = hasPincode || hasTwoFactor;

  // State management
  const [isPincodeSet, setIsPincodeSet] = useState(false);
  const [isOtpEnabled, setIsOtpEnabled] = useState(false);
  const [selectedSecurityMethod, setSelectedSecurityMethod] = useState<
    "pin" | "otp" | null
  >(null);

  // Show success when user has completed setup in this session
  const shouldShowSuccess = isPincodeSet || isOtpEnabled;

  // Show educational content when not actively setting up a specific method AND not showing success
  const shouldShowEducationalContent =
    selectedSecurityMethod === null && !shouldShowSuccess;

  // Callbacks
  const handleBackToSecurityOptions = useCallback(() => {
    setSelectedSecurityMethod(null);
  }, []);

  const handlePinSuccess = useCallback(() => {
    setIsPincodeSet(true);
  }, []);

  const handleOtpSuccess = useCallback(() => {
    setIsOtpEnabled(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {shouldShowSuccess ? "Wallet Secured" : "Secure Your Wallet"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {shouldShowSuccess
            ? isPincodeSet
              ? "PIN code protection is enabled for your wallet"
              : isOtpEnabled
                ? "Two-factor authentication is enabled for your wallet"
                : "Security setup completed"
            : shouldShowEducationalContent
              ? hasAnySecurityMethod
                ? "Add additional security or continue to the next step"
                : "Choose how you want to protect your assets"
              : "Set up security for your wallet"}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "600px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Content based on current state */}
          {shouldShowEducationalContent && (
            <SecurityMethodSelector
              onSetupSecurity={setSelectedSecurityMethod}
            />
          )}

          {shouldShowSuccess ? (
            <SecuritySuccess onNext={onNext} />
          ) : (
            <>
              {selectedSecurityMethod === "pin" && (
                <PinSetupComponent
                  onSuccess={handlePinSuccess}
                  onBack={handleBackToSecurityOptions}
                />
              )}
              {selectedSecurityMethod === "otp" && (
                <OtpSetupComponent
                  onSuccess={handleOtpSuccess}
                  onBack={handleBackToSecurityOptions}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
