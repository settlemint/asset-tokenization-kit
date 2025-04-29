import { DataTable } from "@/components/blocks/data-table/data-table";
import { getIncompleteActions } from "@/lib/actions/incomplete";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { columns } from "./_components/columns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "actions.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("actions"),
    },
    description: t("actions"),
  };
}

export default async function ActionsPage() {
  const { upcoming } = await getIncompleteActions();

  // TODO: Nice "no upcoming tasks" message when no upcoming actions?
  return <DataTable columns={columns} data={upcoming} name="actions" />;
}
