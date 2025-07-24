import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OtpSetupComponent } from "@/components/onboarding/wallet-security/otp-setup-component";
import { PinSetupComponent } from "@/components/onboarding/wallet-security/pin-setup-component";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function SecurityMethodSelector() {
  const { t } = useTranslation(["onboarding"]);

  const [securityMethod, setSecurityMethod] = useState<
    "pin" | "otp" | undefined
  >(undefined);

  if (securityMethod === "pin") {
    return (
      <PinSetupComponent
        closeModal={() => {
          setSecurityMethod(undefined);
        }}
      />
    );
  }

  if (securityMethod === "otp") {
    return (
      <OtpSetupComponent
        closeModal={() => {
          setSecurityMethod(undefined);
        }}
      />
    );
  }

  return (
    <OnboardingStepLayout
      title={t("wallet-security.method-selector.title")}
      description={t("wallet-security.method-selector.description")}
      fullWidth
    >
      <div className="space-y-6">
        <div className="rounded-lg border w-full overflow-hidden">
          {/* Fixed Header */}
          <div className="border-b bg-muted/50">
            <div className="grid grid-cols-10 gap-0 w-full">
              <div className="col-span-4 p-4 font-medium text-foreground text-left">
                {t("wallet-security.method-selector.comparison.feature")}
              </div>
              <div className="col-span-3 p-4 font-medium text-foreground text-center">
                {t("wallet-security.method-selector.pin.title")}
              </div>
              <div className="col-span-3 p-4 font-medium text-foreground text-center">
                {t("wallet-security.method-selector.otp.title")}
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="max-h-64 overflow-y-auto">
            <div className="divide-y">
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.security-level"
                  )}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.security-good"
                  )}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.security-maximum"
                  )}
                </div>
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t("wallet-security.method-selector.comparison.ease-of-use")}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mx-auto" />
                </div>
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t("wallet-security.method-selector.comparison.setup-time")}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.setup-time-pin"
                  )}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.setup-time-otp"
                  )}
                </div>
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.requires-phone-app"
                  )}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <X className="w-4 h-4 text-red-500 mx-auto" />
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                </div>
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.offline-access"
                  )}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                </div>
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t("wallet-security.method-selector.comparison.description")}
                </div>
                <div className="col-span-3 p-4 text-center text-xs text-muted-foreground">
                  {t("wallet-security.method-selector.pin.summary")}
                </div>
                <div className="col-span-3 p-4 text-center text-xs text-muted-foreground">
                  {t("wallet-security.method-selector.otp.summary")}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Buttons */}
          <div className="border-t bg-background">
            <div className="grid grid-cols-10 gap-0 w-full">
              <div className="col-span-4 p-4"></div>
              <div className="col-span-3 p-4 text-center">
                <Button
                  onClick={() => {
                    setSecurityMethod("pin");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {t("wallet-security.method-selector.comparison.choose-pin")}
                </Button>
              </div>
              <div className="col-span-3 p-4 text-center">
                <Button
                  onClick={() => {
                    setSecurityMethod("otp");
                  }}
                  className="w-full"
                >
                  {t("wallet-security.method-selector.comparison.choose-otp")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingStepLayout>
  );
}
