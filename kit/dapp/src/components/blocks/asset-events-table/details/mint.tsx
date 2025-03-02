import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { MintEvent } from "@/lib/queries/asset-events/asset-events-fragments";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { DetailsCard } from "../details-card";

interface MintDetailsProps {
  details: MintEvent;
  symbol?: string;
}

export function MintDetails({ details, symbol }: MintDetailsProps) {
  const t = useTranslations("components.asset-events-table.details");

  const detailItems = [
    {
      key: "to",
      label: t("to"),
      value: (
        <EvmAddress address={details.to.id}>
          <EvmAddressBalances address={details.to.id} />
        </EvmAddress>
      ),
    },
    {
      key: "value",
      label: t("value"),
      value: formatNumber(
        details.value,
        symbol ? { token: symbol } : undefined
      ),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
