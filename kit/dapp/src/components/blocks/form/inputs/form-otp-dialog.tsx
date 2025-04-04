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
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/client";
import type { VerificationType } from "@/lib/utils/typebox/verification-type";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useState } from "react";
import type { FieldValues, Path, PathValue } from "react-hook-form";
import { PincodeInput } from "../../auth/pincode-input";
import { TwoFactorOTPInput } from "../../auth/two-factor-otp-input";
import { TranslatableFormFieldMessage } from "../form-field-translatable-message";
import type { BaseFormInputProps } from "./types";

type InputProps = ComponentPropsWithoutRef<typeof InputOTP>;

type FormOtpDialogProps<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T> | "maxLength" | "pattern"
> &
  BaseFormInputProps<T> & {
    open: boolean;
    onOpenChange: (show: boolean) => void;
    onSubmit: () => void;
  };

export function FormOtpDialog<T extends FieldValues>({
  className,
  open,
  onOpenChange,
  onSubmit,
  disabled,
  ...props
}: FormOtpDialogProps<T>) {
  const handleSubmit = useCallback(() => {
    onSubmit();
    onOpenChange(false);
  }, [onSubmit, onOpenChange]);
  const t = useTranslations("components.form.otp-dialog");
  const { data } = authClient.useSession();
  const isTwoFactorEnabled = data?.user?.twoFactorEnabled ?? false;
  const isPincodeEnabled = data?.user?.pincodeEnabled ?? false;
  const [activeVerificationType, setActiveVerificationType] =
    useState<VerificationType>(isTwoFactorEnabled ? "two-factor" : "pincode");
  const canSwitchVerificationType = isTwoFactorEnabled && isPincodeEnabled;
  const InputComponent =
    activeVerificationType === "two-factor" ? TwoFactorOTPInput : PincodeInput;

  // Get the current path to check if we're in cryptocurrency creation
  const pathname = window.location.pathname;
  const isCryptocurrencyCreation =
    pathname.includes("/portfolio") || pathname.includes("/cryptocurrency");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeVerificationType === "two-factor"
              ? t("two-factor-authentication.title")
              : t("pincode.title")}
          </DialogTitle>
          <DialogDescription>
            {activeVerificationType === "two-factor"
              ? t("two-factor-authentication.description")
              : t("pincode.description")}
          </DialogDescription>
        </DialogHeader>
        <FormField
          {...props}
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1">
              <div className="space-y-2 flex flex-col items-center">
                <FormControl>
                  <InputComponent
                    value={(field.value ?? "").toString()}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <TranslatableFormFieldMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          {...props}
          defaultValue={
            (isTwoFactorEnabled ? "two-factor" : "pincode") as PathValue<
              T,
              Path<T>
            >
          }
          name={"verificationType" as Path<T>}
          render={({ field, formState: { isValid } }) => (
            <FormItem>
              <FormControl hidden>
                <Input type="hidden" value={field.value} />
              </FormControl>
              {canSwitchVerificationType ? (
                <div className="space-y-2 flex flex-col items-center">
                  <Button
                    variant="link"
                    onClick={() => {
                      const newVerificationType =
                        activeVerificationType === "two-factor"
                          ? "pincode"
                          : "two-factor";
                      setActiveVerificationType(newVerificationType);
                      field.onChange(newVerificationType);
                    }}
                  >
                    {t("switch-method")}
                  </Button>
                </div>
              ) : null}
              <DialogFooter className="gap-2 mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  // Always enable the button for cryptocurrency creation, otherwise use validation
                  disabled={isCryptocurrencyCreation ? false : !isValid}
                >
                  {t("confirm")}
                </Button>
              </DialogFooter>
            </FormItem>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
