import { DataTable } from "@/components/blocks/data-table/data-table";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { columns } from "../(table)/columns";

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
  const user = await getUser();
  const actions = await getActionsList({
    userAddress: user.wallet,
    actionType: "Admin",
    executed: false,
    active: false,
  });
  return <DataTable columns={columns} data={actions} name="actions" />;
}
