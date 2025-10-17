import { AddressQrCard } from "@/components/account/shared/address-qr-card";
import { isOrpcNotFoundError } from "@/orpc/helpers/error";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function OnchainIdentityAddressCard() {
  const { t } = useTranslation(["user"]);
  const identityQuery = useSuspenseQuery(
    orpc.system.identity.me.queryOptions({
      throwOnError: (error) => !isOrpcNotFoundError(error),
    })
  );

  const identityError = identityQuery.error;
  const identity = isOrpcNotFoundError(identityError)
    ? null
    : (identityQuery.data ?? null);
  const identityId = identity?.id ?? null;

  return (
    <AddressQrCard
      title={t("fields.onChainIdentity")}
      description={t("fields.onChainIdentityInfo")}
      address={identityId}
      emptyMessage={t("fields.noIdentityRegistered")}
      showPrettyName={false}
    />
  );
}
