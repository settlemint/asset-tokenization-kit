import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { RoleRevokedEvent } from "@/lib/queries/asset-events/asset-events-fragments";
import { roles } from "@/lib/roles";
import { useTranslations } from "next-intl";
import { DetailsCard } from "../details-card";

interface RoleRevokedDetailsProps {
  details: RoleRevokedEvent;
}

export function RoleRevokedDetails({ details }: RoleRevokedDetailsProps) {
  const t = useTranslations("components.asset-events-table.details");

  const detailItems = [
    {
      key: "account",
      label: t("account"),
      value: (
        <EvmAddress address={details.account.id}>
          <EvmAddressBalances address={details.account.id} />
        </EvmAddress>
      ),
    },
    {
      key: "role",
      label: t("role"),
      value: roles[details.role],
    },
  ];

  return <DetailsCard details={detailItems} />;
}
