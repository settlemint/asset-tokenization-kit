import { OnchainIdentityAddressCard } from "@/components/account/onchain-identity/identity-address-card";
import { OnchainIdentityDetailsCard } from "@/components/account/onchain-identity/identity-details-card";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
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
  const { data: identity } = useSuspenseQuery(
    orpc.system.identity.me.queryOptions()
  );

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
        <OnchainIdentityAddressCard identityId={identity?.id ?? null} />
        <OnchainIdentityDetailsCard identity={identity ?? null} />
      </div>
    </div>
  );
}
