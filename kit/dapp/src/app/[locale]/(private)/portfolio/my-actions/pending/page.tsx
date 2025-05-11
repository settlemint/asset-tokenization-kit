import { DataTable } from "@/components/blocks/data-table/data-table";
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
  const t = await getTranslations("actions");

  // if (pending.length === 0) {
  //   return (
  //     <Alert>
  //       <CheckCircle className="h-4 w-4" />
  //       <AlertTitle>{t("all-tasks-complete")}</AlertTitle>
  //       <AlertDescription>
  //         {t("all-tasks-complete-description")}
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

  return <DataTable columns={columns} data={[]} name="actions" />;
}
