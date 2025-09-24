import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
// import { OtpSetupModal } from "@/components/onboarding/wallet-security/otp-setup-modal";
import { PinSetupModal } from "@/components/onboarding/wallet-security/pin-setup-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export function SecurityMethodSelector() {
  const { t } = useTranslation(["onboarding"]);
  const securityMethods = useMemo(
    () =>
      [
        {
          key: "pin",
          title: t("wallet-security.method-selector.pin.title"),
          summary: t("wallet-security.method-selector.pin.summary"),
          securityLevel: "good",
          easyToUse: true,
          requiresPhoneApp: false,
          offlineAccess: true,
          recommended: false,
        },
        // {
        //   key: "otp",
        //   title: t("wallet-security.method-selector.otp.title"),
        //   summary: t("wallet-security.method-selector.otp.summary"),
        //   securityLevel: "maximum",
        //   easyToUse: false,
        //   requiresPhoneApp: true,
        //   offlineAccess: true,
        //   recommended: true,
        // },
      ] as const,
    [t]
  );
  const [showModal, setShowModal] = useState<
    (typeof securityMethods)[number]["key"] | false
  >(false);

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
              {securityMethods.map((method) => (
                <div
                  key={method.key}
                  className="col-span-3 p-4 font-medium text-foreground text-center"
                >
                  {method.title}
                </div>
              ))}
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
                {securityMethods.map((method) => (
                  <div
                    key={method.key}
                    className="col-span-3 p-4 text-center text-sm"
                  >
                    {t(
                      `wallet-security.method-selector.comparison.security-${method.securityLevel}`
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t("wallet-security.method-selector.comparison.ease-of-use")}
                </div>
                {securityMethods.map((method) => (
                  <div
                    key={method.key}
                    className="col-span-3 p-4 text-center text-sm"
                  >
                    {method.easyToUse ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mx-auto" />
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t("wallet-security.method-selector.comparison.setup-time")}
                </div>
                {securityMethods.map((method) => (
                  <div
                    key={method.key}
                    className="col-span-3 p-4 text-center text-sm"
                  >
                    {t(
                      `wallet-security.method-selector.comparison.setup-time-${method.key}`
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.requires-phone-app"
                  )}
                </div>
                {securityMethods.map((method) => (
                  <div
                    key={method.key}
                    className="col-span-3 p-4 text-center text-sm"
                  >
                    {method.requiresPhoneApp ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t(
                    "wallet-security.method-selector.comparison.offline-access"
                  )}
                </div>
                {securityMethods.map((method) => (
                  <div
                    key={method.key}
                    className="col-span-3 p-4 text-center text-sm"
                  >
                    {method.offlineAccess ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm">
                  {t("wallet-security.method-selector.comparison.description")}
                </div>
                {securityMethods.map((method) => (
                  <div
                    key={method.key}
                    className="col-span-3 p-4 text-center text-xs text-muted-foreground"
                  >
                    {method.summary}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-10 gap-0 w-full">
                <div className="col-span-4 p-4 font-medium text-sm" />
                {securityMethods.map((method) => (
                  <div
                    key={method.key}
                    className="col-span-3 p-4 text-center text-xs text-muted-foreground flex flex-col gap-4"
                  >
                    <Button
                      className="self-center"
                      onClick={() => {
                        setShowModal(method.key);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setShowModal(method.key);
                        }
                      }}
                      tabIndex={0}
                      aria-label={t(
                        `wallet-security.method-selector.comparison.choose-${method.key}`
                      )}
                    >
                      {t(
                        `wallet-security.method-selector.comparison.choose-${method.key}`
                      )}
                    </Button>
                    {method.recommended && (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1 self-center text-[0.65rem]"
                      >
                        <Star className="w-3 h-3 " />
                        {t("wallet-security.method-selector.recommended")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PinSetupModal open={showModal === "pin"} onOpenChange={setShowModal} />
      {/* <OtpSetupModal open={showModal === "otp"} onOpenChange={setShowModal} /> */}
    </FormStepLayout>
  );
}
