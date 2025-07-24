import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OtpSetupComponent } from "@/components/onboarding/wallet-security/otp-setup-component";
import { PinSetupComponent } from "@/components/onboarding/wallet-security/pin-setup-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Star, X } from "lucide-react";
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

  const actions = (
    <div className="flex justify-between items-center w-full">
      <div className="flex">
        <Button
          onClick={() => {
            setSecurityMethod("pin");
          }}
          variant="outline"
        >
          {t("wallet-security.method-selector.comparison.choose-pin")}
        </Button>
      </div>
      <div className="flex">
        <Button
          onClick={() => {
            setSecurityMethod("otp");
          }}
        >
          {t("wallet-security.method-selector.comparison.choose-otp")}
        </Button>
      </div>
    </div>
  );

  return (
    <OnboardingStepLayout
      title={t("wallet-security.method-selector.title")}
      description={t("wallet-security.method-selector.description")}
      fullWidth
      actions={actions}
    >
      <div className="flex flex-col h-full">
        <div className="rounded-lg border w-full overflow-hidden flex flex-col flex-1">
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
                <div className="flex flex-col items-center gap-2">
                  {t("wallet-security.method-selector.otp.title")}
                  <Badge variant="default" className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {t("wallet-security.method-selector.recommended")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </OnboardingStepLayout>
  );
}
