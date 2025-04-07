import { TwoFactorPasswordDialog } from "@/components/blocks/auth/two-factor/two-factor-password-dialog";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { TwoFactorOTPInput } from "./two-factor-otp-input";

interface SetupTwoFactorFormProps {
  firstOtp: string;
  onFirstOtpChange: (firstOtp: string) => void;
}

export function SetupTwoFactorForm({
  firstOtp,
  onFirstOtpChange,
}: SetupTwoFactorFormProps) {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);

  const enableTwoFactorAuthentication = async (password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });
      if (error) {
        toast.error(
          t("enable.error-message", {
            error: error.message ?? "Unknown error",
          })
        );
      } else {
        setTwoFactorData(data);
      }
    } catch (error) {
      toast.error(
        t("enable.error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
      <TwoFactorPasswordDialog
        open={isSetPasswordOpen && !twoFactorData}
        onOpenChange={setIsSetPasswordOpen}
        onSubmit={enableTwoFactorAuthentication}
        isLoading={isLoading}
        submitButtonText={t("enable.title")}
      />
    </>
  );
}
