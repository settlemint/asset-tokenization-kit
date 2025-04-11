import { UserTabs } from "@/app/[locale]/(private)/platform/users/[id]/_components/user-tabs";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PageHeader } from "@/components/layout/page-header";
import { getUser } from "@/lib/auth/utils";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { EditUserDropdown } from "./_components/edit-user-dropdown";
interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
    locale: Locale;
  }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserDetail({ id });

  return {
    title: user?.name,
    description: `${user?.name} (${user?.email})`,
  };
}

export default async function UserDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { id, locale } = await params;
  const [currentUser, userForHeader, t] = await Promise.all([
    getUser(),
    getUserDetail({ id }),
    getTranslations("private.users.detail"),
  ]);

  return (
    <div>
      <PageHeader
        title={userForHeader?.name}
        subtitle={
          <EvmAddress address={userForHeader.wallet} prettyNames={false}>
            <EvmAddressBalances address={userForHeader.wallet} />
          </EvmAddress>
        }
        section={t("platform-management")}
        button={
          currentUser.role === "admin" && (
            <EditUserDropdown user={userForHeader} />
          )
        }
      />

      <div className="relative mt-4 space-y-2">
        <UserTabs userId={id} locale={locale} />
      </div>
      {children}
    </div>
  );
}
