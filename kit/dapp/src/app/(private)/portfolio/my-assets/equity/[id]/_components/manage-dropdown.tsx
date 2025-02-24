import { ApproveButton } from '@/app/(private)/portfolio/my-assets/cryptocurrency/[id]/_components/approve-allowance/button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { Address } from 'viem';
import type { Fund } from './data';

export function ManageDropdown({ id, fund, balance }: { id: Address; fund: Fund; balance: number }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          Manage
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative right-4 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown">
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <ApproveButton
            address={id as Address}
            name={fund.name}
            symbol={fund.symbol}
            decimals={fund.decimals}
            balance={balance}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
