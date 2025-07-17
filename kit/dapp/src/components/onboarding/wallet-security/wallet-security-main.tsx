import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { authClient } from "@/lib/auth/auth.client";
import { OtpSetupComponent } from "./otp-setup-component";
import { PinSetupComponent } from "./pin-setup-component";
import { SecurityMethodSelector } from "./security-method-selector";
import { SecuritySuccess } from "./security-success";

interface WalletSecurityMainProps {
  onNext: () => void;
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

export function WalletSecurityMain({ onNext }: WalletSecurityMainProps) {
  const { t } = useTranslation("onboarding");
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
    form.reset();
  }, [form, hasPincode, hasTwoFactor]);

  // Callbacks
  const handleBackToSecurityOptions = useCallback(() => {
    setSelectedSecurityMethod(null);
    form.reset();
  }, [form]);

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
          {shouldShowSuccess
            ? t("steps.security.wallet-secured")
            : t("steps.security.title")}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {shouldShowSuccess
            ? isPincodeSet
              ? t("steps.security.pin-enabled")
              : isOtpEnabled
                ? t("steps.security.two-factor-enabled")
                : t("steps.security.security-setup-completed")
            : shouldShowEducationalContent
              ? hasAnySecurityMethod
                ? t("steps.security.add-additional-security")
                : t("steps.security.choose-protection-method")
              : t("steps.security.setup-wallet-security")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Responsive content container */}
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
