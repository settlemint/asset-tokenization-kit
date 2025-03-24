import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { EditUserDropdown } from "./_components/edit-user-dropdown";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
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

const getTabs = async (
  user: Awaited<ReturnType<typeof getUserDetail>>
): Promise<TabItemProps[]> => {
  const t = await getTranslations("private.users.detail.tabs");
  return [
    {
      name: t("details"),
      href: `/platform/users/${user.id}`,
    },
    {
      name: t("holdings"),
      href: `/platform/users/${user.id}/holdings`,
      badge: user?.assetCount,
    },
    {
      name: t("latest-events"),
      href: `/platform/users/${user.id}/latest-events`,
    },
    {
      name: t("permissions"),
      href: `/platform/users/${user.id}/token-permissions`,
    },
  ];
};

export default async function UserDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  const user = await getUserDetail({ id });
  const t = await getTranslations("private.users.detail");
  const tabs = await getTabs(user);

  return (
    <div>
      <PageHeader
        title={user?.name}
        subtitle={
          <EvmAddress address={user.wallet} prettyNames={false}>
            <EvmAddressBalances address={user.wallet} />
          </EvmAddress>
        }
        section={t("platform-management")}
        button={<EditUserDropdown user={user} />}
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs} />
      </div>
      {children}
    </div>
  );
}
