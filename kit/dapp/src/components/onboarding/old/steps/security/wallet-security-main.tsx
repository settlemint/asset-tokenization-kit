import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { SessionUser } from "@/lib/auth";

import { HorizontalStepper } from "./horizontal-stepper";
import { OtpSetupComponent } from "./otp-setup-component";
import { PinSetupComponent } from "./pin-setup-component";
import { SecurityMethodSelector } from "./security-method-selector";
import { SecuritySuccess } from "./security-success";

interface WalletSecurityMainProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  user?: SessionUser | null | undefined;
  onRegisterAction?: (action: () => void) => void;
  forceShowSelection?: boolean;
}

const pincodeSchema = z
  .object({
    pincode: z.string().length(6, "PIN code must be exactly 6 digits"),
    confirmPincode: z.string().length(6, "PIN code must be exactly 6 digits"),
  })
  .refine((data) => data.pincode === data.confirmPincode, {
    message: "PIN codes don't match",
    path: ["confirmPincode"],
  });

type PincodeFormValues = z.infer<typeof pincodeSchema>;

export function WalletSecurityMain({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  user,
  onRegisterAction,
  forceShowSelection = false,
}: WalletSecurityMainProps) {
  const hasPincode = Boolean(user?.pincodeEnabled);
  const hasTwoFactor = Boolean(user?.twoFactorEnabled);
  const hasAnySecurityMethod = hasPincode || hasTwoFactor;

  // State management
  const [isPincodeSet, setIsPincodeSet] = useState(false);
  const [selectedSecurityMethod, setSelectedSecurityMethod] = useState<
    "pin" | "otp" | null
  >(null);
  const [isOtpEnabled, setIsOtpEnabled] = useState(false);
  const [isPinSelected, setIsPinSelected] = useState(false);
  const [isOtpSelected, setIsOtpSelected] = useState(false);
  const [wantsToModifySecurity, setWantsToModifySecurity] = useState(false);

  // Check if user needs to set up any new security methods
  const needsToSetupPin = isPinSelected && !hasPincode;
  const needsToSetupOtp = isOtpSelected && !hasTwoFactor;
  const needsToSetupAny = needsToSetupPin || needsToSetupOtp;

  // Show success when user has completed setup in this session
  const shouldShowSuccess =
    !wantsToModifySecurity &&
    (isPincodeSet ||
      isOtpEnabled ||
      (hasAnySecurityMethod &&
        !needsToSetupAny &&
        isPinSelected === hasPincode &&
        isOtpSelected === hasTwoFactor));

  // Show educational content when not actively setting up a specific method AND not showing success
  const shouldShowEducationalContent =
    selectedSecurityMethod === null && !shouldShowSuccess;

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
  });

  // Reset state on mount
  useEffect(() => {
    setSelectedSecurityMethod(null);
    setIsPincodeSet(false);
    setIsOtpEnabled(false);
    setWantsToModifySecurity(forceShowSelection);
    setIsPinSelected(hasPincode);
    setIsOtpSelected(hasTwoFactor);
    form.reset();
  }, [form, hasPincode, hasTwoFactor, forceShowSelection]);

  // Callbacks
  const handlePinToggle = useCallback(() => {
    const newPinState = !isPinSelected;
    setIsPinSelected(newPinState);

    if (!newPinState && selectedSecurityMethod === "pin") {
      setSelectedSecurityMethod(null);
      form.reset();
    }
  }, [isPinSelected, selectedSecurityMethod, form]);

  const handleOtpToggle = useCallback(() => {
    const newOtpState = !isOtpSelected;
    setIsOtpSelected(newOtpState);

    if (!newOtpState && selectedSecurityMethod === "otp") {
      setSelectedSecurityMethod(null);
    }
  }, [isOtpSelected, selectedSecurityMethod]);

  const handleBackToSecurityOptions = useCallback(() => {
    setSelectedSecurityMethod(null);
    setWantsToModifySecurity(true);
    form.reset();
  }, [form]);

  const handleSetupSecurity = useCallback(() => {
    if (isPinSelected && !hasPincode) {
      setSelectedSecurityMethod("pin");
    } else if (isOtpSelected && !hasTwoFactor) {
      setSelectedSecurityMethod("otp");
    }
  }, [isPinSelected, hasPincode, isOtpSelected, hasTwoFactor]);

  const handleNext = useCallback(() => {
    if (shouldShowEducationalContent) {
      const hasValidSelection =
        hasAnySecurityMethod &&
        !needsToSetupAny &&
        isPinSelected === hasPincode &&
        isOtpSelected === hasTwoFactor;

      if (hasValidSelection) {
        setWantsToModifySecurity(false);
        return;
      }
      return;
    } else if (shouldShowSuccess) {
      onNext?.();
    }
  }, [
    shouldShowEducationalContent,
    shouldShowSuccess,
    onNext,
    hasAnySecurityMethod,
    needsToSetupAny,
    isPinSelected,
    hasPincode,
    isOtpSelected,
    hasTwoFactor,
    setWantsToModifySecurity,
  ]);

  const handlePinSuccess = useCallback(() => {
    setIsPincodeSet(true);

    if (isOtpSelected && !hasTwoFactor) {
      setSelectedSecurityMethod(null);
      toast.info("Now set up your One-Time Password");
    } else {
      setTimeout(() => {
        onNext?.();
      }, 1000);
    }
  }, [isOtpSelected, hasTwoFactor, onNext]);

  const handleOtpSuccess = useCallback(() => {
    setIsOtpEnabled(true);

    if (isPinSelected && !hasPincode) {
      setSelectedSecurityMethod(null);
      toast.info("Now set up your PIN code");
    } else {
      setTimeout(() => {
        onNext?.();
      }, 1000);
    }
  }, [isPinSelected, hasPincode, onNext]);

  // Register the action for external triggers
  useEffect(() => {
    if (onRegisterAction) {
      onRegisterAction(handleNext);
    }
  }, [onRegisterAction, handleNext]);

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
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Horizontal stepper for PIN/OTP flow */}
          {!shouldShowEducationalContent && !shouldShowSuccess && (
            <HorizontalStepper
              selectedSecurityMethod={selectedSecurityMethod}
              pincodeLength={form.watch("pincode").length}
              confirmPincodeLength={form.watch("confirmPincode").length}
              showConfirmPincode={false}
              isPincodeSet={isPincodeSet}
              hasPincode={hasPincode}
              isOtpEnabled={isOtpEnabled}
              hasTwoFactor={hasTwoFactor}
              pincodeMatch={
                form.watch("pincode") === form.watch("confirmPincode")
              }
            />
          )}

          {/* Content based on current state */}
          {shouldShowEducationalContent && (
            <SecurityMethodSelector
              isPinSelected={isPinSelected}
              isOtpSelected={isOtpSelected}
              hasPincode={hasPincode}
              hasTwoFactor={hasTwoFactor}
              onPinToggle={handlePinToggle}
              onOtpToggle={handleOtpToggle}
              onSetupSecurity={handleSetupSecurity}
              hasAnySecurityMethod={hasAnySecurityMethod}
              needsToSetupAny={needsToSetupAny}
            />
          )}

          {shouldShowSuccess && (
            <SecuritySuccess
              isPincodeSet={isPincodeSet}
              isOtpEnabled={isOtpEnabled}
              onNext={onNext}
              onPrevious={onPrevious}
              onModify={handleBackToSecurityOptions}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
            />
          )}

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
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
}
