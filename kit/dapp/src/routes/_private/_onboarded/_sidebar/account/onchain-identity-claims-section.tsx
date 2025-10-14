import { ClaimsTable } from "@/components/identity/claims-table";
import { isOrpcNotFoundError } from "@/orpc/helpers/error";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function OnchainIdentityClaimsSection() {
  const { t } = useTranslation(["user", "identities"]);
  const identityQuery = useSuspenseQuery(
    orpc.system.identity.me.queryOptions({
      throwOnError: (error) => !isOrpcNotFoundError(error),
    })
  );

  const identityError = identityQuery.error;
  const identity = isOrpcNotFoundError(identityError)
    ? null
    : (identityQuery.data ?? null);

  if (!identity) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("user:fields.noIdentityRegistered")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">
        {t("identities:tabs.claims")}
      </h2>
      <ClaimsTable identityAddress={identity.id} />
    </div>
  );
}
