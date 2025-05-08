import { DataTable } from "@/components/blocks/data-table/data-table";
import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { XvpStatusPill } from "@/components/blocks/xvp-status/status-pill";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getXvPSettlementDetail } from "@/lib/queries/xvp/xvp-detail";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { Clock } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { columns as ApprovalColumns } from "./(approvals)/columns";
import { columns as FlowColumns } from "./(flows)/columns";

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
    namespace: "trade-management",
  });
  const user = await getUser();
  const xvpSettlement = await getXvPSettlementDetail(address, user.currency);

  return (
    <>
      <PageHeader
        title={
          <EvmAddress address={address} prettyNames={false}>
            <EvmAddressBalances address={address} />
          </EvmAddress>
        }
        section={t("page.xvp")}
        pill={<XvpStatusPill xvp={xvpSettlement} />}
      />
      <DetailGrid>
        <DetailGridItem label={t("xvp.columns.created-at")}>
          {formatDate(xvpSettlement.createdAt.toString(), {
            locale,
            type: "absolute",
          })}
        </DetailGridItem>
        <DetailGridItem label={t("xvp.columns.expiry")}>
          <Clock className="size-4 inline-block mr-2 mb-1 text-muted-foreground" />
          {formatDate(xvpSettlement.cutoffDate.toString(), {
            locale,
            type: "absolute",
          })}
        </DetailGridItem>
        <DetailGridItem label={t("xvp.columns.status")}>
          <XvpStatusPill xvp={xvpSettlement} />
        </DetailGridItem>
        <DetailGridItem
          label={t("xvp.auto-execute")}
          info={t("xvp.auto-execute-description")}
        >
          {xvpSettlement.autoExecute
            ? t("forms.summary.yes")
            : t("forms.summary.no")}
        </DetailGridItem>
        <DetailGridItem
          label={t("xvp.columns.total-price")}
          info={t("xvp.total-price-description")}
        >
          {formatNumber(xvpSettlement.totalPrice.amount, {
            locale,
            currency: xvpSettlement.totalPrice.currency,
          })}
        </DetailGridItem>
      </DetailGrid>

      <div className="font-medium text-accent text-xl mt-6 mb-4">
        {t("xvp.flows")}
      </div>
      <DataTable
        columns={FlowColumns}
        data={xvpSettlement.flows}
        name={t("xvp.flows")}
        toolbar={{
          enableToolbar: false,
        }}
        pagination={{
          enablePagination: false,
        }}
      />

      <div className="font-medium text-accent text-xl mt-6 mb-4">
        {t("xvp.approvals")}
      </div>
      <DataTable
        columns={ApprovalColumns}
        data={xvpSettlement.approvals}
        name={t("xvp.approvals")}
        toolbar={{
          enableToolbar: false,
        }}
        pagination={{
          enablePagination: false,
        }}
      />
    </>
  );
}
