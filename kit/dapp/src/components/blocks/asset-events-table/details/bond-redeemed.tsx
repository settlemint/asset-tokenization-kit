import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { BondRedeemedEvent } from "@/lib/queries/asset-events/asset-events-fragments";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { DetailsCard } from "../details-card";

interface BondRedeemedDetailsProps {
  details: BondRedeemedEvent;
}

export function BondRedeemedDetails({ details }: BondRedeemedDetailsProps) {
  const t = useTranslations("components.asset-events-table.details");
  const locale = useLocale();

  const detailItems = [
    {
      key: "holder",
      label: t("holder"),
      value: (
        <EvmAddress address={details.holder.id}>
          <EvmAddressBalances address={details.holder.id} />
        </EvmAddress>
      ),
    },
    {
      key: "bond-amount",
      label: t("bond-amount"),
      value: formatNumber(details.bondAmount, { locale }),
    },
    {
      key: "underlying-amount",
      label: t("underlying-amount"),
      value: formatNumber(details.underlyingAmount, { locale }),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
