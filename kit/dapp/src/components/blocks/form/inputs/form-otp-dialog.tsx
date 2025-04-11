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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { authClient } from "@/lib/auth/client";
import type { VerificationType } from "@/lib/utils/typebox/verification-type";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useState } from "react";
import {
  type FieldValues,
  type Path,
  type PathValue,
  useFormContext,
} from "react-hook-form";
import { TranslatableFormFieldMessage } from "../form-field-translatable-message";
import type { BaseFormInputProps } from "./types";

const LOCAL_STORAGE_KEY = "selected-otp-input";

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

// Debug component to show form state
function FormDebugState() {
  const form = useFormContext();
  const { formState, getValues } = form;
  const { isValid, errors, isDirty, isSubmitting } = formState;
  const values = getValues();

  // Format the values for display
  const formattedValues = Object.entries(values)
    .map(([key, value]) => {
      // Don't show very long values completely
      const displayValue =
        typeof value === "string" && value.length > 50
          ? `${value.substring(0, 50)}...`
          : value;
      return `${key}: ${JSON.stringify(displayValue)}`;
    })
    .join("\n");

  // Format the errors for display
  const formattedErrors = Object.entries(errors)
    .map(([key, error]) => {
      return `${key}: ${error?.message || "Unknown error"}`;
    })
    .join("\n");

  return (
    <div className="p-2 my-2 text-xs bg-gray-100 rounded border border-gray-300">
      <div>
        <strong>Form State Diagnostics:</strong>
      </div>
      <div className="mt-1">
        <strong>isValid:</strong> {String(isValid)}
      </div>
      <div>
        <strong>isDirty:</strong> {String(isDirty)}
      </div>
      <div>
        <strong>isSubmitting:</strong> {String(isSubmitting)}
      </div>
      {errors && Object.keys(errors).length > 0 && (
        <div className="mt-1">
          <strong>Errors:</strong>
          <pre className="mt-1 text-red-500 whitespace-pre-wrap">
            {formattedErrors}
          </pre>
        </div>
      )}
      <div className="mt-1">
        <strong>Values:</strong>
        <pre className="mt-1 whitespace-pre-wrap">{formattedValues}</pre>
      </div>
    </div>
  );
}

export function FormOtpDialog<T extends FieldValues>({
  className,
  open,
  onOpenChange,
  onSubmit,
  disabled,
  ...props
}: FormOtpDialogProps<T>) {
  const {
    setValue,
    formState: { isValid },
    getValues,
  } = useFormContext();

  // Check if verification code has a value
  const verificationCode = getValues(props.name);

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

  // Check if the verification code is valid (6 digits)
  const isVerificationCodeValid =
    typeof verificationCode === "string" && verificationCode.length === 6;

  // Console log the form state for debugging
  console.log("Form state:", {
    isValid,
    verificationCode,
    isVerificationCodeValid,
    formValues: getValues(),
  });

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
                        setIsSwitchingVerificationType(false);
                        setValue("verificationType", "two-factor");
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
                        setIsSwitchingVerificationType(false);
                        setValue("verificationType", "pincode");
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
                      autoFocus
                      onKeyUp={(e) => {
                        if (e.key === "Enter" && isVerificationCodeValid) {
                          handleSubmit();
                        }
                      }}
                    />
                  </FormControl>
                  <TranslatableFormFieldMessage />
                </div>
              </FormItem>
            );
          }}
        />

        {/* Add the debug component here */}
        <FormDebugState />

        <FormField
          {...props}
          defaultValue={activeVerificationType as PathValue<T, Path<T>>}
          name={"verificationType" as Path<T>}
          render={({ field }) => (
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
                      setValue("verificationType", "secret-code");
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
                  disabled={!isVerificationCodeValid}
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
