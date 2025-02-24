import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { Address } from 'viem';
import { ApproveButton } from './approve-allowance/button';
import type { Cryptocurrency } from './data';

export function ManageDropdown({
  id,
  cryptocurrency,
  balance,
}: { id: Address; cryptocurrency: Cryptocurrency; balance: number }) {
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
            name={cryptocurrency.name}
            symbol={cryptocurrency.symbol}
            decimals={cryptocurrency.decimals}
            balance={balance}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
