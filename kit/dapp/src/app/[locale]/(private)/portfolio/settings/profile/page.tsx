import { PageHeader } from "@/components/layout/page-header";
import { metadata } from "@/lib/config/metadata";
import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  PasskeysCard,
  ProvidersCard,
  UpdateNameCard,
} from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PincodeCard } from "./_components/pincode-card";
import { SecretCodesCard } from "./_components/secret-codes-card";
import { TwoFactorCard } from "./_components/two-factor-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "portfolio.settings.profile",
  });

  return {
    title: {
      ...metadata.title,
      default: t("title"),
    },
    description: t("portfolio-management"),
  };
}

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
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <TwoFactorCard />
        <PincodeCard />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChangePasswordCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
        <SecretCodesCard />
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
