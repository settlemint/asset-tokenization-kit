import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpSetupScreenProps {
  otpUri: string | null;
  otpCode: string;
  isEnablingTwoFactor: boolean;
  isVerifyingOtp: boolean;
  onOtpCodeChange: (code: string) => void;
  onOtpVerification: () => void;
}

export function OtpSetupScreen({
  otpUri,
  otpCode,
  isEnablingTwoFactor,
  isVerifyingOtp,
  onOtpCodeChange,
  onOtpVerification,
}: OtpSetupScreenProps) {
  return (
    <div className="space-y-6 text-center">
      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          {otpUri ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpUri)}`}
              alt="QR Code for OTP Setup"
              className="w-36 h-36"
            />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 animate-spin text-primary"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isEnablingTwoFactor
                    ? "Setting up authenticator..."
                    : "Generating QR code..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification section */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold">
          Verify the code from the app
        </h4>

        <div className="flex justify-center">
          <InputOTP
            value={otpCode}
            onChange={onOtpCodeChange}
            maxLength={6}
            disabled={isVerifyingOtp || isEnablingTwoFactor || !otpUri}
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

        {/* Confirm button */}
        <div className="flex justify-center">
          <Button
            onClick={onOtpVerification}
            disabled={
              isVerifyingOtp ||
              isEnablingTwoFactor ||
              otpCode.length !== 6 ||
              !otpUri
            }
            className="min-w-[120px]"
          >
            {isVerifyingOtp ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
