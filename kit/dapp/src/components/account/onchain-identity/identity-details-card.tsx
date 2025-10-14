import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { IdentityStatusBadge } from "@/components/identity/identity-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { useTranslation } from "react-i18next";

interface OnchainIdentityDetailsCardProps {
  identity: Identity | null;
}

export function OnchainIdentityDetailsCard({
  identity,
}: OnchainIdentityDetailsCardProps) {
  const { t } = useTranslation(["identities", "user", "common"]);

  const registration = identity?.registered;
  const registrationDetails =
    registration !== undefined && registration !== false ? registration : null;
  const isRegistered = Boolean(registrationDetails);
  const registrationCountry = registrationDetails?.country ?? null;
  const registrationCountryDisplay = registrationCountry
    ? registrationCountry.toUpperCase()
    : undefined;
  const noIdentityMessage = t("user:fields.noIdentityRegistered");

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{t("identities:tabs.details")}</CardTitle>
        <CardDescription>{t("identities:page.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <DetailGridItem
          label={t("identities:fields.registrationStatus")}
          info={t("identities:fields.registrationStatusInfo")}
        >
          {identity ? (
            <IdentityStatusBadge isRegistered={isRegistered} />
          ) : (
            <span className="text-sm text-muted-foreground">
              {noIdentityMessage}
            </span>
          )}
        </DetailGridItem>

        <DetailGridItem
          label={t("identities:register.form.country")}
          info={t("identities:register.form.countryInfo")}
          value={isRegistered ? registrationCountryDisplay : undefined}
          type="text"
          emptyValue={t("common:none")}
        />
      </CardContent>
    </Card>
  );
}
