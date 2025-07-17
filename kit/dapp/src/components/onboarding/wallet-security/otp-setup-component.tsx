import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/auth.client";
import { twoFactorCode } from "@/lib/zod/validators/two-factor-code";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const logger = createLogger({ level: "debug" });

interface OtpSetupComponentProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function OtpSetupComponent({
  onSuccess,
  onBack,
}: OtpSetupComponentProps) {
  const [otpUri, setOtpUri] = useState<string | null>(null);
  const [otpSetupError, setOtpSetupError] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: enableTwoFactor } = useMutation({
    mutationFn: async () =>
      authClient.twoFactor.enable({
        password: undefined,
        onboarding: true,
      }),
    onSuccess: () => {
      toast.success("OTP setup initiated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to setup OTP");
    },
  });

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: async (code: string) =>
      authClient.twoFactor.verifyTotp({
        code,
      }),
    onSuccess: () => {
      toast.success("OTP verified successfully");
      void queryClient.invalidateQueries({
        queryKey: orpc.user.me.key(),
        refetchType: "all",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      logger.error("OTP verification error:", error);
      toast.error(error.message || "Invalid verification code");
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
                "Invalid verification code",
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

  if (otpSetupError) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Setup Failed
          </h3>
          <p className="text-sm text-muted-foreground">
            Failed to setup OTP authentication. Please try again.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={handleOtpRetry} className="flex-1">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!otpUri) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Setting up OTP...</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we generate your QR code.
          </p>
        </div>
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Set up Authenticator App</h3>
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app
            </p>
          </div>

          <div className="space-y-4">
            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 text-center">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">QR Code</p>
                <div className="h-32 w-32 mx-auto bg-muted-foreground/10 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    Scan with your app
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Entry Option */}
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Can't scan? Enter manually
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">
                  Manual entry key:
                </p>
                <code className="text-xs break-all">{otpUri}</code>
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
                  Enter the 6-digit code from your app
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
          </form>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <footer className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isVerifyingOtp}
          >
            Back
          </Button>
          <Button
            type="button"
            disabled={isVerifyingOtp || form.state.values.otpCode.length !== 6}
            onClick={async () => form.handleSubmit()}
          >
            {isVerifyingOtp ? "Verifying..." : "Verify Code"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
