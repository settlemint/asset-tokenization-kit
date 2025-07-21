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
import { orpc } from "@/orpc/orpc-client";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  errorMessage?: string | null;
  onSubmit: (data: { pincode?: string; otp?: string }) => void;
  onCancel?: () => void;
}

export function VerificationDialog({
  open,
  onOpenChange,
  title,
  description,
  errorMessage = null,
  onSubmit,
  onCancel,
}: VerificationDialogProps) {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());
  const hasPincode = user.verificationTypes.includes("pincode");
  const hasTwoFactor = user.verificationTypes.includes("two-factor");

  const [useOtp, setUseOtp] = useState(!hasPincode && hasTwoFactor);

  const form = useForm({
    defaultValues: { code: "" },
    onSubmit: ({ value }) => {
      onSubmit(useOtp ? { otp: value.code } : { pincode: value.code });
      handleClose();
    },
  });

  const handleClose = () => {
    form.reset();
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field name="code">
            {(field) => (
              <div className="flex flex-col items-center space-y-4">
                <label className="text-base font-medium">
                  {useOtp ? "Authenticator Code" : "PIN Code"}
                </label>
                {useOtp ? (
                  <InputOTP
                    value={field.state.value}
                    onChange={field.handleChange}
                    maxLength={6}
                    autoFocus
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
                ) : (
                  <PincodeInput
                    value={field.state.value}
                    onChange={field.handleChange}
                    autoFocus
                  />
                )}
              </div>
            )}
          </form.Field>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button
              type="submit"
              disabled={form.state.values.code.length !== 6}
              className="w-full"
            >
              Confirm
            </Button>

            {hasPincode && hasTwoFactor && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setUseOtp(!useOtp);
                }}
                className="w-full"
              >
                {useOtp
                  ? "Use PIN Code instead"
                  : "Use Authenticator App instead"}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
