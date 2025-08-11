import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OtpSetupModal } from "@/components/onboarding/wallet-security/otp-setup-modal";
import { PinSetupModal } from "@/components/onboarding/wallet-security/pin-setup-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Star, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function SecurityMethodSelector() {
  const { t } = useTranslation(["onboarding"]);

  const [showPinModal, setShowPinModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  return (
    <FormStepLayout
      title={t("wallet-security.method-selector.title")}
      description={t("wallet-security.method-selector.description")}
      fullWidth
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
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mx-auto" />
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
                  <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
                </div>
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.offline-access"
                  )}
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
                </div>
                <div className="col-span-3 p-4 text-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
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

              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm" />
                <div className="col-span-3 p-4 text-center text-xs text-muted-foreground">
                  <Button
                    onClick={() => {
                      setShowPinModal(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowPinModal(true);
                      }
                    }}
                    tabIndex={0}
                    aria-label={t(
                      "wallet-security.method-selector.comparison.choose-pin"
                    )}
                  >
                    {t("wallet-security.method-selector.comparison.choose-pin")}
                  </Button>
                </div>
                <div className="col-span-3 p-4 text-center text-xs text-muted-foreground flex flex-col gap-4">
                  <Button
                    className="self-center"
                    onClick={() => {
                      setShowOtpModal(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowOtpModal(true);
                      }
                    }}
                    tabIndex={0}
                    aria-label={t(
                      "wallet-security.method-selector.comparison.choose-otp"
                    )}
                  >
                    {t("wallet-security.method-selector.comparison.choose-otp")}
                  </Button>
                  <Badge
                    variant="default"
                    className="flex items-center gap-1 self-center text-[0.65rem]"
                  >
                    <Star className="w-3 h-3 " />
                    {t("wallet-security.method-selector.recommended")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PinSetupModal open={showPinModal} onOpenChange={setShowPinModal} />
      <OtpSetupModal open={showOtpModal} onOpenChange={setShowOtpModal} />
    </FormStepLayout>
  );
}
