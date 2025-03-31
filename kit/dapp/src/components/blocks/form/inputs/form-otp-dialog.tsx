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
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/client";
import type { VerificationMethod } from "@/lib/utils/typebox/verification-method";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useState } from "react";
import type { FieldValues, Path, PathValue } from "react-hook-form";
import { PincodeInput } from "../../auth/pincode-input";
import { TwoFactorOTPInput } from "../../auth/two-factor-otp-input";
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
  const [activeMethod, setActiveMethod] = useState<VerificationMethod>(
    isTwoFactorEnabled ? "two-factor" : "pincode"
  );
  const canSwitchMethod = isTwoFactorEnabled && isPincodeEnabled;
  const InputComponent =
    activeMethod === "two-factor" ? TwoFactorOTPInput : PincodeInput;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeMethod === "two-factor"
              ? t("two-factor-authentication.title")
              : t("pincode.title")}
          </DialogTitle>
          <DialogDescription>
            {activeMethod === "two-factor"
              ? t("two-factor-authentication.description")
              : t("pincode.description")}
          </DialogDescription>
        </DialogHeader>
        <FormField
          {...props}
          render={({ field, formState: { isValid } }) => (
            <FormItem className="flex flex-col space-y-1">
              <div className="space-y-2">
                <FormControl>
                  <InputComponent
                    value={(field.value ?? "").toString()}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={!isValid}>
                  {t("confirm")}
                </Button>
              </DialogFooter>
            </FormItem>
          )}
        />{" "}
        <FormField
          {...props}
          defaultValue={
            (isTwoFactorEnabled ? "two-factor" : "pincode") as PathValue<
              T,
              Path<T>
            >
          }
          name={"verificationMethod" as Path<T>}
          render={({ field }) => (
            <FormItem hidden>
              <FormControl>
                <Input type="hidden" value={field.value} />
              </FormControl>
              {canSwitchMethod ? (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newMethod =
                        activeMethod === "two-factor"
                          ? "pincode"
                          : "two-factor";
                      setActiveMethod(newMethod);
                      field.onChange(newMethod);
                    }}
                  >
                    {t("switch-method")}
                  </Button>
                </DialogFooter>
              ) : null}
            </FormItem>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
