import { PincodeInput } from "@/components/onboarding/pincode-input";
import { SecretCodeInput } from "@/components/onboarding/secret-code-input";
import { TwoFactorOTPInput } from "@/components/onboarding/two-factor-otp-input";
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
import type { InputOTP } from "@/components/ui/input-otp";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { authClient } from "@/lib/auth/auth.client";
import type { VerificationType } from "@/lib/zod/validators/verification-type";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  type PathValue,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { TranslatableFormFieldMessage } from "../form-field-translatable-message";
import type { BaseFormInputProps } from "./types";

const LOCAL_STORAGE_KEY = "selected-otp-input";
type InputProps = ComponentPropsWithoutRef<typeof InputOTP>;

type FormOtpDialogProps<T extends FieldValues> = Omit<
  InputProps,
  "maxLength" | "pattern"
> &
  BaseFormInputProps<T> & {
    open: boolean;
    onOpenChange: (show: boolean) => void;
    onSubmit: () => void;
  };

export function FormOtpDialog<T extends FieldValues>({
  open,
  onOpenChange,
  onSubmit,
  disabled,
  ...props
}: FormOtpDialogProps<T>) {
  const { setValue, control } = useFormContext();

  // Use useWatch to monitor the verification code changes
  const verificationCode = useWatch({
    control,
    name: props.name as Path<{ verificationCode: string }>,
    defaultValue: "",
  });

  const [isVerificationCodeValid, setIsVerificationCodeValid] = useState(false);

  useEffect(() => {
    const isValid =
      typeof verificationCode === "string" && verificationCode.length === 6;
    setIsVerificationCodeValid(isValid);
  }, [verificationCode]);

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
    useLocalStorage<VerificationType>(
      LOCAL_STORAGE_KEY,
      isTwoFactorEnabled ? "two-factor" : "pincode"
    );

  const verificationConfig = {
    "two-factor": {
      title: t("two-factor-authentication.title"),
      description: t("two-factor-authentication.description"),
      InputComponent: TwoFactorOTPInput,
    },
    pincode: {
      title: t("pincode.title"),
      description: t("pincode.description"),
      InputComponent: PincodeInput,
    },
    "secret-code": {
      title: t("secret-codes.title"),
      description: t("secret-codes.description"),
      InputComponent: SecretCodeInput,
    },
  };

  const { InputComponent, title, description } =
    verificationConfig[activeVerificationType];

  const onSelectTwoFactor = useCallback(() => {
    setActiveVerificationType("two-factor");
    setIsSwitchingVerificationType(false);
    setValue("verificationType", "two-factor");
  }, [setActiveVerificationType, setValue]);

  const onSelectPincode = useCallback(() => {
    setActiveVerificationType("pincode");
    setIsSwitchingVerificationType(false);
    setValue("verificationType", "pincode");
  }, [setActiveVerificationType, setValue]);

  const onSelectSecretCode = useCallback(() => {
    setActiveVerificationType("secret-code");
    setIsSwitchingVerificationType(false);
    setValue("verificationType", "secret-code");
  }, [setActiveVerificationType, setValue]);

  const switchingVerificationType = useCallback(() => {
    setIsSwitchingVerificationType(true);
  }, [setIsSwitchingVerificationType]);

  const onKeyUpSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isVerificationCodeValid) {
        handleSubmit();
      }
    },
    [isVerificationCodeValid, handleSubmit]
  );

  const renderVerificationCodeInput = useCallback(
    ({ field }: { field: ControllerRenderProps<T, Path<T>> }) => {
      if (isSwitchingVerificationType) {
        return (
          <div className="flex flex-col gap-4">
            {isTwoFactorEnabled && (
              <Button variant="outline" onClick={onSelectTwoFactor}>
                {t("method-select.two-factor-authentication")}
              </Button>
            )}
            {isPincodeEnabled && (
              <Button variant="outline" onClick={onSelectPincode}>
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
                autoFocus
                onKeyUp={onKeyUpSubmit}
              />
            </FormControl>
            <TranslatableFormFieldMessage />
          </div>
        </FormItem>
      );
    },
    [
      InputComponent,
      isSwitchingVerificationType,
      isTwoFactorEnabled,
      isPincodeEnabled,
      onSelectTwoFactor,
      onSelectPincode,
      disabled,
      onKeyUpSubmit,
      t,
    ]
  );

  const onCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const renderVerificationTypeSelect = useCallback(
    ({ field }: { field: ControllerRenderProps<T, Path<T>> }) => (
      <FormItem>
        <FormControl hidden>
          <Input type="hidden" value={field.value} />
        </FormControl>
        <div className="space-y-2 flex flex-col items-center">
          {isSwitchingVerificationType ? (
            <Button variant="link" onClick={onSelectSecretCode}>
              {t("method-select.use-secret-codes")}
            </Button>
          ) : (
            <Button variant="link" onClick={switchingVerificationType}>
              {t("switch-method")}
            </Button>
          )}
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!isVerificationCodeValid}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </FormItem>
    ),
    [
      handleSubmit,
      isSwitchingVerificationType,
      isVerificationCodeValid,
      onCancel,
      onSelectSecretCode,
      switchingVerificationType,
      t,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {isSwitchingVerificationType ? (
            <DialogTitle>{t("method-select.title")}</DialogTitle>
          ) : (
            <>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </>
          )}
        </DialogHeader>
        <FormField {...props} render={renderVerificationCodeInput} />
        <FormField
          {...props}
          defaultValue={activeVerificationType as PathValue<T, Path<T>>}
          name={"verificationType" as Path<T>}
          render={renderVerificationTypeSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
