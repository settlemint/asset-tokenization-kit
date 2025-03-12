import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PageHeaderProps {
  address: Address;
}

export async function CryptoCurrencyPageHeader({ address }: PageHeaderProps) {
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const t = await getTranslations("admin.cryptocurrencies.table");
  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{cryptocurrency.name}</span>
          <span className="text-muted-foreground">
            ({cryptocurrency.symbol})
          </span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      section={t("asset-management")}
    />
  );
}
