import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { ApprovalEvent } from "@/lib/queries/asset-events/asset-events-fragments";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { DetailsCard } from "../details-card";

interface ApprovalDetailsProps {
  details: ApprovalEvent;
  symbol?: string;
}

export function ApprovalDetails({
  details,
  symbol = "",
}: ApprovalDetailsProps) {
  const t = useTranslations("components.asset-events-table.details");

  const detailItems = [
    {
      key: "from",
      label: t("from"),
      value: (
        <EvmAddress address={details.owner.id}>
          <EvmAddressBalances address={details.owner.id} />
        </EvmAddress>
      ),
    },
    {
      key: "to",
      label: t("to"),
      value: (
        <EvmAddress address={details.spender.id}>
          <EvmAddressBalances address={details.spender.id} />
        </EvmAddress>
      ),
    },
    {
      key: "amount",
      label: t("amount"),
      value: formatNumber(details.value, { token: symbol }),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
