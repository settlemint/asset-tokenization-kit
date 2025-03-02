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
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { ChevronDown } from "lucide-react";
import type { PropsWithChildren } from "react";
import { ChangeRoleAction } from "../(table)/_components/actions/change-role-action";
import { UpdateKycStatusAction } from "../(table)/_components/actions/update-kyc-status-action";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: "Details",
    href: `/admin/users/${id}`,
  },
  {
    name: "Holdings",
    href: `/admin/users/${id}/holdings`,
  },
  {
    name: "Last transactions",
    href: `/admin/users/${id}/last-transactions`,
  },
  {
    name: "Permissions",
    href: `/admin/users/${id}/token-permissions`,
  },
];

export default async function UserDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  const user = await getUserDetail({ id });

  return (
    <div>
      <PageHeader
        title={user?.name}
        subtitle={
          <EvmAddress address={user.wallet} prettyNames={false}>
            <EvmAddressBalances address={user.wallet} />
          </EvmAddress>
        }
        button={
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="self-end">
              <Button variant="default">
                Edit user
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
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
