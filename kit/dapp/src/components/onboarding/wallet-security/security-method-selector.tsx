import { BulletPoint } from "@/components/onboarding/bullet-point";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OtpSetupComponent } from "@/components/onboarding/wallet-security/otp-setup-component";
import { PinSetupComponent } from "@/components/onboarding/wallet-security/pin-setup-component";
import { Lock, Shield } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function SecurityMethodSelector() {
  const { t } = useTranslation(["onboarding"]);

  const [securityMethod, setSecurityMethod] = useState<
    "pin" | "otp" | undefined
  >(undefined);
  const [showPinModal, setShowPinModal] = useState(false);

  // Keep the old behavior for OTP for now
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
    <>
      <OnboardingStepLayout
        title={t("wallet-security.method-selector.title")}
        description={t("wallet-security.method-selector.description")}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <BulletPoint>
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  {t("wallet-security.method-selector.pin.title")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("wallet-security.method-selector.pin.description")}
                </p>
              </div>
            </BulletPoint>

            <BulletPoint>
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  {t("wallet-security.method-selector.otp.title")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("wallet-security.method-selector.otp.description")}
                </p>
              </div>
            </BulletPoint>
          </div>

          <p className="text-sm text-foreground leading-relaxed">
            {t("wallet-security.method-selector.choose-one")}
          </p>

          <div className="flex gap-4 mt-6">
            <div
              className="flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 border-input bg-background hover:bg-muted/50"
              onClick={() => {
                setShowPinModal(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {t("wallet-security.method-selector.pin.title")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("wallet-security.method-selector.pin.summary")}
              </p>
            </div>

            <div
              className="flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 border-input bg-background hover:bg-muted/50"
              onClick={() => {
                setSecurityMethod("otp");
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {t("wallet-security.method-selector.otp.title")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("wallet-security.method-selector.otp.summary")}
              </p>
            </div>
          </div>
        </div>
      </OnboardingStepLayout>

      <PinSetupComponent open={showPinModal} onOpenChange={setShowPinModal} />
    </>
  );
}
