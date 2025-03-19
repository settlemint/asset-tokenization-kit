import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { TransferEvent } from "@/lib/queries/asset-events/asset-events-fragments";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DetailsCard } from "../details-card";

interface TransferDetailsProps {
  details: TransferEvent;
  symbol?: string;
  showRelated?: "to" | "from" | "all";
}

interface DetailItem {
  key: string;
  label: string;
  value: ReactNode;
}

export function TransferDetails({
  details,
  symbol = "",
  showRelated = "all",
}: TransferDetailsProps) {
  const t = useTranslations("components.asset-events-table.details");
  const locale = useLocale();

  const isFromZero =
    details.from.id === "0x0000000000000000000000000000000000000000";
  const isToZero =
    details.to.id === "0x0000000000000000000000000000000000000000";

  const showFrom = showRelated === "from" || showRelated === "all";
  const showTo = showRelated === "to" || showRelated === "all";

  const detailItems: DetailItem[] = [
    {
      key: "amount",
      label: t("amount"),
      value: formatNumber(details.value, { token: symbol, locale: locale }),
    },
  ];

  if (showFrom) {
    detailItems.push({
      key: "from",
      label: t("from"),
      value: isFromZero ? (
        t("new-mint")
      ) : (
        <EvmAddress address={details.from.id}>
          <EvmAddressBalances address={details.from.id} />
        </EvmAddress>
      ),
    });
  }

  if (showTo) {
    detailItems.push({
      key: "to",
      label: t("to"),
      value: isToZero ? (
        t("burned")
      ) : (
        <EvmAddress address={details.to.id}>
          <EvmAddressBalances address={details.to.id} />
        </EvmAddress>
      ),
    });
  }

  return <DetailsCard details={detailItems} />;
}
