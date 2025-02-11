import { ChangeRoleAction } from '@/app/(private)/admin/users/(table)/_components/actions/change-role-action';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { ChevronDown } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { getUser } from './(details)/_components/data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/users/${id}`,
  },
  {
    name: 'Holdings',
    href: `/admin/users/${id}/holdings`,
  },
  {
    name: 'Last transactions',
    href: `/admin/users/${id}/last-transactions`,
  },
  {
    name: 'Token permissions',
    href: `/admin/users/${id}/token-permissions`,
  },
];

export default async function UserDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const user = await getUser(id);

  return (
    <div>
      <h1 className="flex items-center font-bold text-2xl">
        <span className="mr-2">{user?.name}</span>
      </h1>
      <div className="flex justify-between text-muted-foreground text-sm">
        <EvmAddress address={user?.wallet}>
          <EvmAddressBalances address={user?.wallet} />
        </EvmAddress>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="self-end">
            <Button variant="default">
              Edit user
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="relative right-10 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown">
            <DropdownMenuItem asChild className="dropdown-menu-item">
              <ChangeRoleAction user={user} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
