import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { UserBlockedEvent } from "@/lib/queries/asset-events/asset-events-fragments";
import { useTranslations } from "next-intl";
import { DetailsCard } from "../details-card";

interface UserBlockedDetailsProps {
  details: UserBlockedEvent;
}

export function UserBlockedDetails({ details }: UserBlockedDetailsProps) {
  const t = useTranslations("components.asset-events-table.details");

  const detailItems = [
    {
      key: "user",
      label: t("user"),
      value: (
        <EvmAddress address={details.user.id}>
          <EvmAddressBalances address={details.user.id} />
        </EvmAddress>
      ),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
