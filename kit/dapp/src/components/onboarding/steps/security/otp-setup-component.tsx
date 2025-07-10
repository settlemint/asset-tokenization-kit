import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/auth.client";
import type { SessionUser } from "@/lib/auth";
import { queryClient } from "@/lib/query.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const logger = createLogger({ level: "debug" });

interface OtpSetupComponentProps {
  onSuccess: () => void;
  onBack: () => void;
  user?: SessionUser | null | undefined;
}

export function OtpSetupComponent({
  onSuccess,
  onBack,
  user,
}: OtpSetupComponentProps) {
  const { sessionKey } = useContext(AuthQueryContext);
  const [otpUri, setOtpUri] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpSetupError, setOtpSetupError] = useState(false);

  const { mutate: enableTwoFactor, isPending: isEnablingTwoFactor } =
    useMutation({
      mutationFn: async () => {
        logger.debug("enableTwoFactor called");

        const response = await fetch("/api/auth/two-factor/enable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // During onboarding, we don't have a password yet
            // The server should handle this gracefully during onboarding
            password: undefined,
            onboarding: true, // Flag to indicate this is during onboarding
          }),
          credentials: "include", // Include cookies for session
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      onSuccess: (data) => {
        logger.debug("enableTwoFactor success:", data);

        if (data && typeof data === "object" && "totpURI" in data) {
          setOtpUri(data.totpURI as string);
          toast.success("OTP setup initiated");
        } else {
          logger.warn("Invalid data format:", data);
          toast.error("Failed to generate QR code");
        }
      },
      onError: (error: Error) => {
        logger.error("enableTwoFactor error:", error);
        setOtpSetupError(true); // Prevent infinite loop
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
        queryKey: sessionKey,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      logger.error("OTP verification error:", error);
      toast.error(error.message || "Invalid verification code");
    },
  });

  const handleOtpRetry = useCallback(() => {
    setOtpSetupError(false);
    setOtpUri(null);
    setOtpCode("");
    enableTwoFactor();
  }, [enableTwoFactor]);

  // Auto-initiate OTP setup on mount
  useEffect(() => {
    if (!user?.twoFactorEnabled && !otpUri && !otpSetupError) {
      enableTwoFactor();
    }
  }, [user?.twoFactorEnabled, otpUri, otpSetupError, enableTwoFactor]);

  const handleOtpCodeChange = useCallback(
    (value: string) => {
      setOtpCode(value);
      if (value.length === 6) {
        verifyOtp(value);
      }
    },
    [verifyOtp]
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

      <div className="space-y-4">
        <div className="text-center">
          <label className="text-sm font-medium">
            Enter the 6-digit code from your app
          </label>
        </div>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpCode}
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
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isVerifyingOtp}
        >
          Back
        </Button>
        <Button
          onClick={() => verifyOtp(otpCode)}
          disabled={isVerifyingOtp || otpCode.length !== 6}
          className="flex-1"
        >
          {isVerifyingOtp ? "Verifying..." : "Verify Code"}
        </Button>
      </div>
    </div>
  );
}
