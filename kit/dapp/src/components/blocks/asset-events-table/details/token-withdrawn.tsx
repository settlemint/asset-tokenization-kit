import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { TokenWithdrawnEvent } from "@/lib/queries/asset-events/asset-events-fragments";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { DetailsCard } from "../details-card";

interface TokenWithdrawnDetailsProps {
  details: TokenWithdrawnEvent;
}

export function TokenWithdrawnDetails({ details }: TokenWithdrawnDetailsProps) {
  const t = useTranslations("components.asset-events-table.details");
  const locale = useLocale();

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
      key: "asset",
      label: t("asset"),
      value: (
        <>
          <EvmAddress address={details.token.id}>
            <EvmAddressBalances address={details.token.id} />
          </EvmAddress>{" "}
          ({details.token.symbol})
        </>
      ),
    },
    {
      key: "amount",
      label: t("amount"),
      value: formatNumber(details.amount, { locale }),
    },
  ];

  return <DetailsCard details={detailItems} />;
}
