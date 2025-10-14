import { PincodeInput } from "@/components/form/inputs/pincode-input";
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
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";
interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  errorMessage?: string | null;
  onSubmit: (data: UserVerification) => void;
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
  const { t } = useTranslation("components");
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());
  const hasPincode = user.verificationTypes.includes("PINCODE");
  const hasTwoFactor = user.verificationTypes.includes("OTP");

  const [useOtp, setUseOtp] = useState(hasTwoFactor);

  const codeSchema = useMemo(
    () =>
      z.object({
        code: z.string().length(6, {
          message: t("verificationDialog.codeLengthError"),
        }),
      }),
    [t]
  );

  const onValidate = useCallback(
    ({ value }: { value: z.infer<typeof codeSchema> }) => {
      const result = codeSchema.safeParse(value);
      if (result.error) {
        return result.error.message;
      }
    },
    [codeSchema]
  );

  const form = useForm({
    defaultValues: { code: "" },
    validators: {
      onChange: onValidate,
      onMount: onValidate,
    },
    onSubmit: ({ value }) => {
      onSubmit({
        secretVerificationCode: value.code,
        verificationType: useOtp ? "OTP" : "PINCODE",
      });
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
          className="space-y-6 mb-4"
        >
          <form.Field name="code">
            {(field) => (
              <div className="flex flex-col items-center space-y-4">
                <label className="text-base font-medium">
                  {useOtp
                    ? t("verificationDialog.authenticatorCode")
                    : t("verificationDialog.pinCode")}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="press-effect"
            >
              {t("verificationDialog.cancel")}
            </Button>

            <form.Subscribe
              selector={(state) => state.errors}
              children={(errors) => (
                <Button
                  type="submit"
                  disabled={Object.keys(errors).length > 0}
                  className="press-effect"
                >
                  {t("verificationDialog.confirm")}
                </Button>
              )}
            />

            {hasPincode && hasTwoFactor && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setUseOtp(!useOtp);
                }}
                className="press-effect"
              >
                {useOtp
                  ? t("verificationDialog.usePinInstead")
                  : t("verificationDialog.useAuthenticatorInstead")}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
