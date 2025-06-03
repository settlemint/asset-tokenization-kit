"use client";

import { DataTable } from "@/components/blocks/data-table/data-table";
import type { AirdropRecipient } from "@/lib/queries/airdrop/airdrop-recipient-schema";
import { HeartMinus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Columns } from "./my-airdrops-table-columns";

interface MyAirdropsClientTableProps {
  airdropRecipients: AirdropRecipient[];
  title: string;
}

export function MyAirdropsClientTable({
  airdropRecipients,
  title,
}: MyAirdropsClientTableProps) {
  const t = useTranslations("portfolio.my-airdrops");

  return (
    <DataTable
      columns={Columns}
      data={airdropRecipients}
      name={title}
      customEmptyState={{
        icon: HeartMinus,
        title: t("empty-state.title"),
        description: t("empty-state.description"),
      }}
    />
  );
}
