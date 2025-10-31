import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { EntityStatusBadge } from "@/components/participants/entities/entity-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isOrpcNotFoundError } from "@/orpc/helpers/error";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function OnchainIdentityDetailsCard() {
  const { t } = useTranslation(["identities", "user", "common"]);
  const identityQuery = useSuspenseQuery(
    orpc.system.identity.me.queryOptions({
      throwOnError: (error) => !isOrpcNotFoundError(error),
    })
  );

  const identityError = identityQuery.error;
  const identity = isOrpcNotFoundError(identityError)
    ? null
    : (identityQuery.data ?? null);

  const isRegistered = !!identity?.registered;
  const registrationDetails =
    identity && typeof identity.registered === "object"
      ? identity.registered
      : null;
  const registrationCountryDisplay =
    registrationDetails?.country?.toUpperCase();

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
            <EntityStatusBadge isRegistered={isRegistered} />
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("user:fields.noIdentityRegistered")}
            </span>
          )}
        </DetailGridItem>

        <DetailGridItem
          label={t("identities:register.form.country")}
          info={t("identities:register.form.countryInfo")}
          value={registrationCountryDisplay}
          type="text"
          emptyValue={t("common:none")}
        />
      </CardContent>
    </Card>
  );
}
