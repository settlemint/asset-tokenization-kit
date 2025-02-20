import { ChangeRoleAction } from '@/app/(private)/admin/users/(table)/_components/actions/change-role-action';
import { UpdateKycStatusAction } from '@/app/(private)/admin/users/(table)/_components/actions/update-kyc-status-action';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { ChevronDown } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
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
    name: 'Permissions',
    href: `/admin/users/${id}/token-permissions`,
  },
];

export default async function UserDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const user = await getUser(id);

  return (
    <div>
      <PageHeader
        title={user?.name}
        subtitle={
          <EvmAddress address={user.wallet as Address} prettyNames={false}>
            <EvmAddressBalances address={user.wallet as Address} />
          </EvmAddress>
        }
        button={
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="self-end">
              <Button variant="default">
                Edit user
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="relative right-10 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown">
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
