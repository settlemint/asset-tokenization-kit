import { SecretCodesForm } from "@/components/blocks/auth/secret-codes/secret-codes-form";
import { FormStep } from "@/components/blocks/form/form-step";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import type { SetupWalletSecurityInput } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export function SecretCodes() {
  const t = useTranslations("private.auth.wallet-security.form.secret-codes");
  const { getValues, setValue } = useFormContext<SetupWalletSecurityInput>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || error || getValues("secretCodes").length > 0) {
      return;
    }
    // Add a timer to ensure only one request is made
    const timer = setTimeout(() => {
      setIsLoading(true);
      authClient.secretCodes
        .generate()
        .then(({ error, data }) => {
          if (error) {
            setError(error.message ?? "Unknown error");
            return;
          }
          setValue("secretCodes", data.secretCodes);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoading, setValue, getValues, error]);

  return (
    <FormStep title={t("title")} description={t("description")}>
      {error && (
        <Alert
          variant="destructive"
          className="mb-4 border-destructive text-destructive"
        >
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      {isLoading ? (
        <Skeleton className="h-40 w-full bg-muted/50" />
      ) : (
        <SecretCodesForm existingSecretCodes={getValues("secretCodes") ?? []} />
      )}
    </FormStep>
  );
}

SecretCodes.validatedFields = [
  "secretCodes",
] as (keyof SetupWalletSecurityInput)[];
