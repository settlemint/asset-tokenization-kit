import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VerificationType } from "@atk/zod/verification-type";
import { useTranslation } from "react-i18next";

const VERIFICATION_TYPE_TRANSLATIONS = {
  PINCODE: "wallet.pinCodeEnabled",
  OTP: "wallet.otpEnabled",
  SECRET_CODES: "wallet.recoveryCodesEnabled",
} as const;

interface VerificationFactorsCardProps {
  verificationTypes: VerificationType[];
}

export function VerificationFactorsCard({
  verificationTypes,
}: VerificationFactorsCardProps) {
  const { t } = useTranslation(["user", "common", "onboarding"]);

  return (
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
          {verificationTypes.length > 0 ? (
            verificationTypes.map((type) => {
              const translationKey = VERIFICATION_TYPE_TRANSLATIONS[type];
              const label = translationKey ? t(translationKey) : type;

              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Badge
                    variant="default"
                    className="bg-sm-state-success-background text-sm-state-success hover:bg-sm-state-success-background/90"
                  >
                    {t("wallet.enabled")}
                  </Badge>
                </div>
              );
            })
          ) : (
            <p className="py-4 text-center text-muted-foreground">
              {t("wallet.noVerificationMethods")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
