import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TFunction } from "i18next";

interface ConfirmRegisterViewProps {
  countryLabel: string;
  ownerWallet: string;
  t: TFunction<"identities">;
}

export function ConfirmRegisterView({
  countryLabel,
  ownerWallet,
  t,
}: ConfirmRegisterViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t("register.confirm.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            {t("register.form.country")}
          </span>
          <span className="font-medium">{countryLabel}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            {t("register.form.walletAddress")}
          </span>
          <span className="font-mono text-xs break-all">{ownerWallet}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          {t("register.confirm.description")}
        </p>
      </CardContent>
    </Card>
  );
}
