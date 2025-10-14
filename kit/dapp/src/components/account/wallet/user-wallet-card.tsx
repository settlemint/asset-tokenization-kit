import { AddressQrCard } from "@/components/account/shared/address-qr-card";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";

interface UserWalletCardProps {
  address: Address | null;
}

export function UserWalletCard({ address }: UserWalletCardProps) {
  const { t } = useTranslation(["user"]);

  return (
    <AddressQrCard
      title={t("wallet.userWallet")}
      description={t("wallet.userWalletDescription")}
      address={address}
      emptyMessage={t("fields.noWalletConnected")}
      showPrettyName={false}
    />
  );
}
