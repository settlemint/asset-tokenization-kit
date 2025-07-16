import { PincodeInput } from "@/components/form/inputs/pincode-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "@tanstack/react-form";
import { useCallback, useEffect, useState } from "react";
type VerificationMethod = "pincode" | "otp";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  hasPincode?: boolean;
  hasTwoFactor?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  confirmText?: string;
  cancelText?: string;
  switchToPinText?: string;
  switchToOtpText?: string;
  errorMessage?: string | null;
  onPincodeSubmit: (pincode: string) => void;
  onOtpSubmit: (otp: string) => void;
  onCancel?: () => void;
}

export function VerificationDialog({
  open,
  onOpenChange,
  title,
  description,
  hasPincode = true,
  hasTwoFactor = false,
  isLoading = false,
  loadingText = "Processing...",
  confirmText = "Confirm",
  cancelText = "Cancel",
  switchToPinText = "Use PIN Code instead",
  switchToOtpText = "Use Authenticator App instead",
  errorMessage = null,
  onPincodeSubmit,
  onOtpSubmit,
  onCancel,
}: VerificationDialogProps) {
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>("pincode");

  // Set initial method based on available options
  useEffect(() => {
    if (!hasPincode && hasTwoFactor) {
      setVerificationMethod("otp");
    } else {
      setVerificationMethod("pincode");
    }
  }, [hasPincode, hasTwoFactor]);

  // Forms for PIN and OTP using TanStack Form
  const pincodeForm = useForm({
    defaultValues: {
      pincode: "",
    },
    onSubmit: async ({ value }) => {
      onPincodeSubmit(value.pincode);
    },
  });

  const otpForm = useForm({
    defaultValues: {
      otp: "",
    },
    onSubmit: async ({ value }) => {
      onOtpSubmit(value.otp);
    },
  });

  // Track form values for reactive button states
  const [pincodeValue, setPincodeValue] = useState("");
  const [otpValue, setOtpValue] = useState("");

  const handleSwitchMethod = useCallback(() => {
    const newMethod = verificationMethod === "pincode" ? "otp" : "pincode";
    setVerificationMethod(newMethod);
    // Reset both forms when switching
    pincodeForm.reset();
    otpForm.reset();
    setPincodeValue("");
    setOtpValue("");
  }, [verificationMethod, pincodeForm, otpForm]);

  const handleCloseModal = useCallback(() => {
    onOpenChange(false);
    pincodeForm.reset();
    otpForm.reset();
    setPincodeValue("");
    setOtpValue("");
    onCancel?.();
  }, [onOpenChange, pincodeForm, otpForm, onCancel]);

  // Reset forms when dialog opens or when error is cleared
  useEffect(() => {
    if (open) {
      pincodeForm.reset();
      otpForm.reset();
      setPincodeValue("");
      setOtpValue("");
    }
  }, [open, pincodeForm, otpForm]);

  // Reset forms when error is cleared (for retry attempts)
  useEffect(() => {
    if (errorMessage === null) {
      pincodeForm.reset();
      otpForm.reset();
      setPincodeValue("");
      setOtpValue("");
    }
  }, [errorMessage, pincodeForm, otpForm]);

  const currentTitle =
    verificationMethod === "pincode"
      ? title
      : title.replace("PIN code", "authenticator code");
  const currentDescription =
    verificationMethod === "pincode"
      ? description
      : description.replace("PIN code", "authenticator code");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentTitle}</DialogTitle>
          <DialogDescription>{currentDescription}</DialogDescription>
        </DialogHeader>

        {verificationMethod === "pincode" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void pincodeForm.handleSubmit();
            }}
            className="space-y-6"
          >
            <pincodeForm.Field name="pincode">
              {(field) => (
                <div className="flex flex-col items-center space-y-4">
                  <label className="text-base font-medium">PIN Code</label>
                  <PincodeInput
                    value={field.state.value}
                    onChange={(value) => {
                      field.handleChange(value);
                      setPincodeValue(value);
                    }}
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
              )}
            </pincodeForm.Field>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mt-4">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-2 mt-6">
              <Button
                type="submit"
                disabled={isLoading || pincodeValue.length !== 6}
                className="w-full"
              >
                {isLoading ? loadingText : confirmText}
              </Button>

              {hasTwoFactor && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSwitchMethod}
                  disabled={isLoading}
                  className="w-full"
                >
                  {switchToOtpText}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isLoading}
                className="w-full"
              >
                {cancelText}
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void otpForm.handleSubmit();
            }}
            className="space-y-6"
          >
            <otpForm.Field name="otp">
              {(field) => (
                <div className="flex flex-col items-center space-y-4">
                  <label className="text-base font-medium">
                    Authenticator Code
                  </label>
                  <InputOTP
                    value={field.state.value}
                    onChange={(value) => {
                      field.handleChange(value);
                      setOtpValue(value);
                    }}
                    maxLength={6}
                    autoFocus
                    disabled={isLoading}
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
              )}
            </otpForm.Field>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mt-4">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-2 mt-6">
              <Button
                type="submit"
                disabled={isLoading || otpValue.length !== 6}
                className="w-full"
              >
                {isLoading ? loadingText : confirmText}
              </Button>

              {hasPincode && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSwitchMethod}
                  disabled={isLoading}
                  className="w-full"
                >
                  {switchToPinText}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isLoading}
                className="w-full"
              >
                {cancelText}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
