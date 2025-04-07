import { FormStep } from "@/components/blocks/form/form-step";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import {
  WalletSecurityMethodOptions,
  type SetupWalletSecurityInput,
} from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function SelectMethod() {
  const { control, setValue } = useFormContext<SetupWalletSecurityInput>();
  const t = useTranslations("private.auth.wallet-security.form.select-method");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormField
        control={control}
        name="method"
        render={() => (
          <FormItem className="flex flex-col space-y-1">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setValue(
                    "method",
                    WalletSecurityMethodOptions.TwoFactorAuthentication
                  );
                }}
              >
                {t("two-factor-authentication")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setValue("method", WalletSecurityMethodOptions.Pincode);
                }}
              >
                {t("pincode")}
              </Button>
            </div>
          </FormItem>
        )}
      />
    </FormStep>
  );
}

SelectMethod.validatedFields = [
  "method",
] satisfies (keyof SetupWalletSecurityInput)[];
