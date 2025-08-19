import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/auth.client";
import { twoFactorCode } from "@atk/zod/validators/two-factor-code";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { toast } from "sonner";

interface OtpSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const logger = createLogger();

export function OtpSetupModal({ open, onOpenChange }: OtpSetupModalProps) {
  const { t } = useTranslation("onboarding");
  const { refreshUserState } = useOnboardingNavigation();
  const [otpUri, setOtpUri] = useState<string | null>(null);
  const [otpSetupError, setOtpSetupError] = useState(false);
  const [otpSecret, setOtpSecret] = useState<string | null>(null);

  const { mutate: enableTwoFactor } = useMutation({
    mutationFn: async () =>
      authClient.twoFactor.enable({
        password: undefined,
      }),
    onSuccess: async (data) => {
      try {
        await refreshUserState();

        // Extract OTP URI from response
        if (data.data?.totpURI) {
          setOtpUri(data.data.totpURI);

          // Extract secret from URI for manual entry
          try {
            const url = new URL(data.data.totpURI);
            const secret = url.searchParams.get("secret");
            if (secret) {
              setOtpSecret(secret);
            } else {
              logger.error("OTP URI is missing the 'secret' parameter.", {
                uri: data.data.totpURI,
              });
            }
          } catch (error) {
            logger.error("Failed to parse OTP URI for secret extraction.", {
              error,
            });
          }

          toast.success(t("wallet-security.otp.setup-initiated"));
        } else {
          setOtpSetupError(true);
          toast.error(t("wallet-security.otp.setup-failed"));
        }
      } catch (error: unknown) {
        setOtpSetupError(true);
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("wallet-security.otp.setup-failed");
        toast.error(errorMessage);
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
      try {
        await refreshUserState();
        toast.success(t("wallet-security.otp.verified-success"));
        handleClose();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("wallet-security.otp.refresh-failed");
        toast.error(errorMessage);
      }
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
    setOtpSecret(null);
    form.reset();
    enableTwoFactor();
  }, [enableTwoFactor, form]);

  const handleClose = useCallback(() => {
    form.reset();
    setOtpSetupError(false);
    setOtpUri(null);
    setOtpSecret(null);
    onOpenChange(false);
  }, [form, onOpenChange]);

  const handleOtpCodeChange = useCallback(
    (value: string) => {
      form.setFieldValue("otpCode", value);
      if (value.length === 6) {
        void form.handleSubmit();
      }
    },
    [form]
  );

  // Start OTP setup when dialog opens
  useEffect(() => {
    if (open) {
      enableTwoFactor();
    }
  }, [open, enableTwoFactor]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {otpSetupError ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                {t("wallet-security.otp.setup-failed-title")}
              </DialogTitle>
              <DialogDescription>
                {t("wallet-security.otp.setup-failed-description")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                {t("wallet-security.otp.back")}
              </Button>
              <Button onClick={handleOtpRetry}>
                {t("wallet-security.otp.try-again")}
              </Button>
            </div>
          </>
        ) : otpUri ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("wallet-security.otp.setup-title")}</DialogTitle>
              <DialogDescription>
                {t("wallet-security.otp.setup-description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* QR Code Container */}
              <div className="bg-gradient-to-br from-[--sm-background-gradient-start] to-[--sm-background-gradient-end] p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 text-center">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t("wallet-security.otp.qr-code-label")}
                  </p>
                  <div className="flex justify-center">
                    <div className="p-2 rounded-md bg-[--sm-background-lightest] dark:bg-[--sm-background-darkest]">
                      <QRCode
                        value={otpUri || ""}
                        size={192}
                        bgColor="var(--sm-background-lightest)"
                        fgColor="var(--sm-accent)"
                        className="dark:[&_path:first-of-type]:fill-[--sm-background-darkest] dark:[&_path:last-of-type]:fill-[--sm-accent]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Entry Option */}
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  {t("wallet-security.otp.manual-entry")}
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-md space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("wallet-security.otp.manual-entry-url")}
                    </p>
                    <code className="text-xs break-all font-mono">
                      {otpUri || t("wallet-security.otp.loading")}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("wallet-security.otp.manual-entry-key")}
                    </p>
                    <code className="text-xs break-all font-mono">
                      {otpSecret || t("wallet-security.otp.loading")}
                    </code>
                  </div>
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isVerifyingOtp}
                >
                  {t("wallet-security.otp.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isVerifyingOtp || form.state.values.otpCode.length !== 6
                  }
                >
                  {isVerifyingOtp
                    ? t("wallet-security.otp.verifying")
                    : t("wallet-security.otp.verify-code")}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("wallet-security.otp.setting-up")}</DialogTitle>
              <DialogDescription>
                {t("wallet-security.otp.setting-up-description")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
