import { PincodeInput } from "@/components/blocks/auth/pincode/pincode-input";
import { SecretCodeInput } from "@/components/blocks/auth/secret-codes/secret-code-input";
import { TwoFactorOTPInput } from "@/components/blocks/auth/two-factor/two-factor-otp-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/client";
import type { VerificationType } from "@/lib/utils/typebox/verification-type";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useState } from "react";
import type { FieldValues, Path, PathValue } from "react-hook-form";
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
  const [isSwitchingVerificationType, setIsSwitchingVerificationType] =
    useState(false);
  const isTwoFactorEnabled = data?.user?.twoFactorEnabled ?? false;
  const isPincodeEnabled = data?.user?.pincodeEnabled ?? false;
  const [activeVerificationType, setActiveVerificationType] =
    useState<VerificationType>(isTwoFactorEnabled ? "two-factor" : "pincode");

  // Get the current path to check if we're in cryptocurrency creation
  const pathname = window.location.pathname;
  const isCryptocurrencyCreation =
    pathname.includes("/portfolio") || pathname.includes("/cryptocurrency");

  function getTitle(verificationType: VerificationType) {
    switch (verificationType) {
      case "two-factor":
        return t("two-factor-authentication.title");
      case "pincode":
        return t("pincode.title");
      default:
        return t("secret-codes.title");
    }
  }

  function getDescription(verificationType: VerificationType) {
    switch (verificationType) {
      case "two-factor":
        return t("two-factor-authentication.description");
      case "pincode":
        return t("pincode.description");
      default:
        return t("secret-codes.description");
    }
  }

  function getInputComponent(verificationType: VerificationType) {
    switch (verificationType) {
      case "two-factor":
        return TwoFactorOTPInput;
      case "pincode":
        return PincodeInput;
      default:
        return SecretCodeInput;
    }
  }

  const InputComponent = getInputComponent(activeVerificationType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {isSwitchingVerificationType ? (
            <DialogTitle>{t("method-select.title")}</DialogTitle>
          ) : (
            <>
              <DialogTitle>{getTitle(activeVerificationType)}</DialogTitle>
              <DialogDescription>
                {getDescription(activeVerificationType)}
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        <FormField
          {...props}
          render={({ field }) => {
            if (isSwitchingVerificationType) {
              return (
                <div className="flex flex-col gap-4">
                  {isTwoFactorEnabled && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveVerificationType("two-factor");
                        field.onChange("two-factor");
                      }}
                    >
                      {t("method-select.two-factor-authentication")}
                    </Button>
                  )}
                  {isPincodeEnabled && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveVerificationType("pincode");
                        field.onChange("pincode");
                      }}
                    >
                      {t("method-select.pincode")}
                    </Button>
                  )}
                </div>
              );
            }
            return (
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
            );
          }}
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
              <div className="space-y-2 flex flex-col items-center">
                {isSwitchingVerificationType ? (
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsSwitchingVerificationType(false);
                      setActiveVerificationType("secret-code");
                      field.onChange("secret-code");
                    }}
                  >
                    {t("method-select.use-secret-codes")}
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsSwitchingVerificationType(true);
                    }}
                  >
                    {t("switch-method")}
                  </Button>
                )}
              </div>
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
