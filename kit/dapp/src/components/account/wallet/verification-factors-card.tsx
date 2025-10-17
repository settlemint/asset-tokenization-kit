import {
  DefaultVerificationFactorItem,
  VERIFICATION_FACTOR_COMPONENTS,
  type VerificationFactorComponentProps,
} from "@/components/account/wallet/verification-factor-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const VERIFICATION_TYPE_TRANSLATIONS = {
  PINCODE: "wallet.pinCodeEnabled",
  OTP: "wallet.otpEnabled",
  SECRET_CODES: "wallet.recoveryCodesEnabled",
} as const;

export function VerificationFactorsCard() {
  const { t } = useTranslation(["user", "common", "onboarding"]);
  const { data: user, refetch } = useSuspenseQuery(orpc.user.me.queryOptions());

  const fallbackError = useMemo(
    () => t("common:errors.somethingWentWrong"),
    [t]
  );

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("wallet.verificationFactors")}
          </CardTitle>
          <CardDescription>
            {t("wallet.verificationFactorsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {user.verificationTypes.length > 0 ? (
              user.verificationTypes.map((type) => {
                const translationKey = VERIFICATION_TYPE_TRANSLATIONS[type];
                const label = translationKey ? t(translationKey) : type;
                const enabledLabel = t("wallet.enabled");
                const Component =
                  VERIFICATION_FACTOR_COMPONENTS[type] ??
                  DefaultVerificationFactorItem;
                const componentProps: VerificationFactorComponentProps = {
                  label,
                  enabledLabel,
                  fallbackError,
                  onRefetch: refetch,
                };

                return <Component key={type} {...componentProps} />;
              })
            ) : (
              <p className="py-4 text-center text-muted-foreground">
                {t("wallet.noVerificationMethods")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
