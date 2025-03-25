import MyContactsTable from "@/components/blocks/my-contacts-table/my-contacts-table";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { MyContactsActions } from "./_components/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio.my-contacts",
  });

  return {
    title: {
      ...metadata.title,
      default: t("title"),
    },
    description: t("description"),
  };
}

export default async function MyContactsPage() {
  const t = await getTranslations("portfolio.my-contacts");
  const user = await getUser();

  return (
    <>
      <PageHeader
        title={t("title")}
        section={t("description")}
        button={<MyContactsActions />}
      />
      <MyContactsTable userId={user.id} title={t("title")} />
    </>
  );
}
