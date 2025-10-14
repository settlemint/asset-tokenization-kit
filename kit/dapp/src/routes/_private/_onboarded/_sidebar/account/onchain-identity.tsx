import { OnchainIdentityAddressCard } from "@/components/account/onchain-identity/identity-address-card";
import { OnchainIdentityDetailsCard } from "@/components/account/onchain-identity/identity-details-card";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { ClaimsTable } from "@/components/identity/claims-table";
import { isOrpcNotFoundError } from "@/orpc/helpers/error";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/onchain-identity"
)({
  component: OnchainIdentity,
});

function OnchainIdentity() {
  const { t } = useTranslation(["user", "common", "identities"]);
  const identityQuery = useSuspenseQuery(
    orpc.system.identity.me.queryOptions({
      throwOnError: (error) => !isOrpcNotFoundError(error),
    })
  );
  const identityError = identityQuery.error;
  const identity = isOrpcNotFoundError(identityError)
    ? null
    : (identityQuery.data ?? null);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <RouterBreadcrumb />
      <div className="mt-4 space-y-2">
        <h1 className="text-3xl font-bold">
          {t("onchainIdentity.title", {
            defaultValue: "Onchain identity",
          })}
        </h1>
        <p className="text-muted-foreground">
          {t("onchainIdentity.description", {
            defaultValue: "Manage your onchain identity settings.",
          })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OnchainIdentityAddressCard />
        <OnchainIdentityDetailsCard />
      </div>

      {identity ? (
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">
            {t("identities:tabs.claims")}
          </h2>
          <ClaimsTable identityAddress={identity.id} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("user:fields.noIdentityRegistered")}
        </p>
      )}
    </div>
  );
}
