import { PincodeInput } from "@/components/blocks/auth/pincode/pincode-input";
import { SetupTwoFactorForm } from "@/components/blocks/auth/two-factor/setup-two-factor-form";
import { FormStep } from "@/components/blocks/form/form-step";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  type SetupWalletSecurityInput,
  WalletSecurityMethodOptions,
} from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export function SetupVerification() {
  const { getValues, setValue, control } =
    useFormContext<SetupWalletSecurityInput>();
  const t = useTranslations(
    "private.auth.wallet-security.form.set-verification"
  );
  const selectedMethod = getValues("verificationType");
  console.log("selectedMethod", selectedMethod);

  useEffect(() => {
    setValue("verificationCode", "");
  }, [setValue]);

  return (
    <FormStep
      title={
        selectedMethod === WalletSecurityMethodOptions.TwoFactorAuthentication
          ? t("authenticator-app.title")
          : t("pincode.title")
      }
      description={
        selectedMethod === WalletSecurityMethodOptions.TwoFactorAuthentication
          ? t("authenticator-app.description")
          : t("pincode.description")
      }
    >
      {selectedMethod ===
        WalletSecurityMethodOptions.TwoFactorAuthentication && (
        <FormField
          control={control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <SetupTwoFactorForm
                  firstOtp={field.value ?? ""}
                  onFirstOtpChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {selectedMethod === WalletSecurityMethodOptions.Pincode && (
        <FormField
          control={control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PincodeInput
                  value={field.value}
                  onChange={field.onChange}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormStep>
  );
}

SetupVerification.validatedFields = [
  "verificationCode",
] as (keyof SetupWalletSecurityInput)[];
