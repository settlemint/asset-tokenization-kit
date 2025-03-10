import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserDetail, type UserDetail } from "@/lib/queries/user/user-detail";
import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { ChangeRoleAction } from "../(table)/_components/actions/change-role-action";
import { UpdateKycStatusAction } from "../(table)/_components/actions/update-kyc-status-action";

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

const getTabs = async (user: UserDetail): Promise<TabItemProps[]> => {
  const t = await getTranslations("admin.users.detail.tabs");
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
      name: t("last_transactions"),
      href: `/platform/users/${user.id}/last-transactions`,
      badge: user?.transactionCount,
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
  const t = await getTranslations("admin.users.detail");
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
        button={
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="self-end">
              <Button variant="default">
                {t("edit_user")}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="relative right-10 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl p-0 shadow-dropdown">
              <ChangeRoleAction user={user} />
              <UpdateKycStatusAction user={user} />
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs} />
      </div>
      {children}
    </div>
  );
}
