import { Check } from "lucide-react";

interface HorizontalStepperProps {
  selectedSecurityMethod: "pin" | "otp" | null;
  pincodeLength: number;
  confirmPincodeLength: number;
  showConfirmPincode: boolean;
  isPincodeSet: boolean;
  hasPincode: boolean;
  isOtpEnabled: boolean;
  hasTwoFactor: boolean;
  pincodeMatch: boolean;
}

export function HorizontalStepper({
  selectedSecurityMethod,
  pincodeLength,
  confirmPincodeLength,
  showConfirmPincode,
  isPincodeSet,
  hasPincode,
  isOtpEnabled,
  hasTwoFactor,
  pincodeMatch,
}: HorizontalStepperProps) {
  // Step 1: PIN entry completed
  const step1Complete =
    (selectedSecurityMethod === "pin" && pincodeLength === 6) ||
    isPincodeSet ||
    hasPincode;

  // Step 2: PIN confirmation completed
  const step2Complete =
    isPincodeSet ||
    hasPincode ||
    (showConfirmPincode && confirmPincodeLength === 6 && pincodeMatch);

  // Step 3: OTP setup completed
  const step3Complete = isOtpEnabled || hasTwoFactor;

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center">
        {/* Step 1: Enter PIN */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 transition-all duration-300 ${
            step1Complete
              ? "bg-sm-state-success border-sm-state-success text-white"
              : "bg-background border-input text-muted-foreground"
          }`}
        >
          {step1Complete ? (
            <Check className="w-5 h-5" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
          )}
        </div>

        {/* Line between steps */}
        <div
          className={`w-16 h-0.5 -mx-px transition-all duration-300 ${
            step1Complete ? "bg-sm-state-success" : "bg-input"
          }`}
        />

        {/* Step 2: Confirm PIN */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 transition-all duration-300 ${
            step2Complete
              ? "bg-sm-state-success border-sm-state-success text-white"
              : "bg-background border-input text-muted-foreground"
          }`}
        >
          {step2Complete ? (
            <Check className="w-5 h-5" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
          )}
        </div>

        {/* Line between steps */}
        <div
          className={`w-16 h-0.5 -mx-px transition-all duration-300 ${
            step2Complete ? "bg-sm-state-success" : "bg-input"
          }`}
        />

        {/* Step 3: OTP Setup */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 transition-all duration-300 ${
            step3Complete
              ? "bg-sm-state-success border-sm-state-success text-white"
              : "bg-background border-input text-muted-foreground"
          }`}
        >
          {step3Complete ? (
            <Check className="w-5 h-5" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
          )}
        </div>
      </div>
    </div>
  );
}
