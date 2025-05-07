import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; address: Address }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "trade-management.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("xvp"),
    },
    description: t("xvp"),
  };
}

export default async function XvpPage({
  params,
}: {
  params: Promise<{ locale: Locale; address: Address }>;
}) {
  const { locale, address } = await params;
  const t = await getTranslations({
    locale,
    namespace: "trade-management.page",
  });

  return (
    <>
      <PageHeader
        title={
          <EvmAddress address={address} prettyNames={false}>
            <EvmAddressBalances address={address} />
          </EvmAddress>
        }
        section={t("xvp")}
      />
    </>
  );
}
