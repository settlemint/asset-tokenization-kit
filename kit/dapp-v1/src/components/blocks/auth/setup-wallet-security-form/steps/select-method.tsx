import { FormStep } from "@/components/blocks/form/form-step";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import type { SetupWalletSecurityInput } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { WalletSecurityMethodOptions } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function SelectMethod() {
  const { control, setValue } = useFormContext<SetupWalletSecurityInput>();
  const t = useTranslations("private.auth.wallet-security.form.select-method");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormField
        control={control}
        name="verificationType"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-1">
            <div className="flex flex-col gap-4">
              {/*<Button
                variant="outline"
                onClick={() => {
                  setValue(
                    "verificationType",
                    WalletSecurityMethodOptions.TwoFactorAuthentication,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );
                }}
              >
                {t("two-factor-authentication")}
              </Button>*/}
              <Button
                variant="outline"
                onClick={() => {
                  setValue(
                    "verificationType",
                    WalletSecurityMethodOptions.Pincode,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );
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
  "verificationType",
] satisfies (keyof SetupWalletSecurityInput)[];
