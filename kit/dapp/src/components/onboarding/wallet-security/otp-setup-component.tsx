import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/auth.client";
import { twoFactorCode } from "@/lib/zod/validators/two-factor-code";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function OtpSetupComponent({ closeModal }: { closeModal: () => void }) {
  const { t } = useTranslation("onboarding");
  const { refreshUserState } = useOnboardingNavigation();
  const [otpUri, setOtpUri] = useState<string | null>(null);
  const [otpSetupError, setOtpSetupError] = useState(false);

  const { mutate: enableTwoFactor } = useMutation({
    mutationFn: async () =>
      authClient.twoFactor.enable({
        password: undefined,
        onboarding: true,
      }),
    onSuccess: async (data) => {
      await refreshUserState();

      // Extract OTP URI from response
      if (data.data?.totpURI) {
        setOtpUri(data.data.totpURI);
        toast.success(t("wallet-security.otp.setup-initiated"));
      } else {
        setOtpSetupError(true);
        toast.error(t("wallet-security.otp.setup-failed"));
      }
    },
    onError: (error: Error) => {
      setOtpSetupError(true);
      toast.error(error.message || t("wallet-security.otp.setup-error"));
    },
  });

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: async (code: string) =>
      authClient.twoFactor.verifyTotp({
        code,
      }),
    onSuccess: async () => {
      await refreshUserState();
      toast.success(t("wallet-security.otp.verified-success"));
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error.message || t("wallet-security.otp.invalid-code"));
    },
  });

  const form = useForm({
    defaultValues: {
      otpCode: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        // Validate OTP code using zod validator
        const otpResult = twoFactorCode().safeParse(value.otpCode);
        if (!otpResult.success) {
          return {
            fields: {
              otpCode:
                otpResult.error.issues[0]?.message ??
                t("wallet-security.otp.invalid-code"),
            },
          };
        }
      },
    },
    onSubmit: ({ value }) => {
      verifyOtp(value.otpCode);
    },
  });

  const handleOtpRetry = useCallback(() => {
    setOtpSetupError(false);
    setOtpUri(null);
    form.reset();
    enableTwoFactor();
  }, [enableTwoFactor, form]);

  const handleOtpCodeChange = useCallback(
    (value: string) => {
      form.setFieldValue("otpCode", value);
      if (value.length === 6) {
        void form.handleSubmit();
      }
    },
    [form]
  );

  // Start OTP setup when component mounts
  useEffect(() => {
    enableTwoFactor();
  }, [enableTwoFactor]);

  if (otpSetupError) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            {t("wallet-security.otp.setup-failed-title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("wallet-security.otp.setup-failed-description")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={closeModal} className="flex-1">
            {t("wallet-security.otp.back")}
          </Button>
          <Button onClick={handleOtpRetry} className="flex-1">
            {t("wallet-security.otp.try-again")}
          </Button>
        </div>
      </div>
    );
  }

  if (!otpUri) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {t("wallet-security.otp.setting-up")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("wallet-security.otp.setting-up-description")}
          </p>
        </div>
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {t("wallet-security.otp.setup-title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("wallet-security.otp.setup-description")}
        </p>
      </div>

      <div className="space-y-4">
        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 text-center">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {t("wallet-security.otp.qr-code-label")}
            </p>
            <div className="h-32 w-32 mx-auto bg-muted-foreground/10 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                {t("wallet-security.otp.scan-with-app")}
              </span>
            </div>
          </div>
        </div>

        {/* Manual Entry Option */}
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            {t("wallet-security.otp.manual-entry")}
          </summary>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">
              {t("wallet-security.otp.manual-entry-key")}
            </p>
            <code className="text-xs break-all">
              {otpUri || t("wallet-security.otp.loading")}
            </code>
          </div>
        </details>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="space-y-4">
          <div className="text-center">
            <label className="text-sm font-medium">
              {t("wallet-security.otp.enter-code")}
            </label>
          </div>
          <form.Field name="otpCode">
            {(field) => (
              <div>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={field.state.value}
                    onChange={handleOtpCodeChange}
                    disabled={isVerifyingOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive text-center mt-2">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="flex-1"
            disabled={isVerifyingOtp}
          >
            {t("wallet-security.otp.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isVerifyingOtp || form.state.values.otpCode.length !== 6}
            className="flex-1"
          >
            {isVerifyingOtp
              ? t("wallet-security.otp.verifying")
              : t("wallet-security.otp.verify-code")}
          </Button>
        </div>
      </form>
    </div>
  );
}
