import { PasswordDialog } from "@/components/blocks/auth/password-dialog";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Skeleton } from "../../../ui/skeleton";
import { TwoFactorOTPInput } from "./two-factor-otp-input";

interface SetupTwoFactorFormProps {
  firstOtp: string;
  onFirstOtpChange: (firstOtp: string) => void;
}

export function SetupTwoFactorForm({
  firstOtp,
  onFirstOtpChange,
}: SetupTwoFactorFormProps) {
  const { data: session } = authClient.useSession();
  const isInitialOnboardingFinished =
    session?.user.initialOnboardingFinished ?? true;
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(
    isInitialOnboardingFinished
  );
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);

  const enableTwoFactorAuthentication = useCallback(
    async (password?: string) => {
      try {
        setIsLoading(true);
        const { data, error } = await authClient.twoFactor.enable({
          password: password ?? "",
        });
        if (error) {
          throw new Error(error.message);
        }
        setTwoFactorData(data);
      } catch (error) {
        toast.error(
          t("enable.error-message", {
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!isInitialOnboardingFinished && !twoFactorData) {
      setIsSetPasswordOpen(false);
      enableTwoFactorAuthentication();
    }
  }, [
    isInitialOnboardingFinished,
    enableTwoFactorAuthentication,
    twoFactorData,
  ]);

  return (
    <>
      {twoFactorData ? (
        <div className="space-y-4">
          <div className="flex justify-center w-full">
            <QRCode
              className="rounded-md bg-muted p-4"
              value={twoFactorData?.totpURI ?? ""}
              size={256}
            />
          </div>
          <label className="flex justify-center w-full text-md font-semibold">
            {t("setup-mfa.enter-code-title")}
          </label>
          <div className="flex justify-center w-full pb-6">
            <TwoFactorOTPInput
              value={firstOtp}
              onChange={onFirstOtpChange}
              autoFocus
            />
          </div>
        </div>
      ) : (
        <Skeleton className="h-60 w-full bg-muted/50" />
      )}
      <PasswordDialog
        open={isSetPasswordOpen && !twoFactorData}
        onOpenChange={setIsSetPasswordOpen}
        onSubmit={enableTwoFactorAuthentication}
        isLoading={isLoading}
        submitButtonText={t("enable.title")}
        description={t("enable.password-description")}
      />
    </>
  );
}
