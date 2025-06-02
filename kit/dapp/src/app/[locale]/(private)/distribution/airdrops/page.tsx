import { AirdropDesignButton } from "@/components/blocks/airdrop/design-dialog/airdrop-design-button";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
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

  return (
    <>
      <PageHeader
        title={t("airdrops")}
        button={<AirdropDesignButton currentUser={user} />}
      />
    </>
  );
}
