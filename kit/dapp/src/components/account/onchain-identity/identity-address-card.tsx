import { AddressQrCard } from "@/components/account/shared/address-qr-card";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { useTranslation } from "react-i18next";

interface OnchainIdentityAddressCardProps {
  identityId: Identity["id"] | null;
}

export function OnchainIdentityAddressCard({
  identityId,
}: OnchainIdentityAddressCardProps) {
  const { t } = useTranslation(["user"]);

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
