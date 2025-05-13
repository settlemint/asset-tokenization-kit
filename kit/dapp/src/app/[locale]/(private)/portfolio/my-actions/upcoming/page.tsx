import { ActionsTable } from "@/components/blocks/actions-table/actions-table";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

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
    status: "UPCOMING",
    userAddress: user.wallet,
    type: "User",
  });
  return <ActionsTable status="UPCOMING" actions={actions} />;
}
