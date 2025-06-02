import { AirdropDesignButton } from "@/components/blocks/airdrop/design-dialog/airdrop-design-button";
import { DataTable } from "@/components/blocks/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import { getAirdropList } from "@/lib/queries/airdrop/airdrop-list";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { columns } from "./(table)/columns";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "distribution.page",
  });

  return {
    title: {
      ...metadata.title,
      default: t("airdrops"),
    },
    description: t("airdrops"),
  };
}

export default async function AirdropsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, user] = await Promise.all([
    getTranslations({
      locale,
      namespace: "distribution.page",
    }),
    getUser(),
  ]);
  const airdrops = await getAirdropList(user.wallet);

  return (
    <>
      <PageHeader
        title={t("airdrops")}
        button={<AirdropDesignButton currentUser={user} />}
      />
      <DataTable columns={columns} data={airdrops} name={t("airdrops")} />
    </>
  );
}
