import { PageHeader } from "@/components/layout/page-header";
import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  PasskeysCard,
  ProvidersCard,
  UpdateNameCard,
} from "@daveyplate/better-auth-ui";
import { getTranslations } from "next-intl/server";

export default async function SecuritySettingsPage() {
  const t = await getTranslations("portfolio.settings.profile");
  return (
    <>
      <PageHeader title={t("title")} section={t("portfolio-management")} />
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <UpdateNameCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
        <ChangeEmailCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
      </div>
      <ChangePasswordCard
        classNames={{
          footer:
            "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
        }}
      />
      <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProvidersCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
        <PasskeysCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
      </div>
      <DeleteAccountCard
        classNames={{
          footer:
            "p-6 py-4 md:py-3 bg-transparent border-none justify-self-end",
        }}
      />
    </>
  );
}
