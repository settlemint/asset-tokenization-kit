import { ApproveAllowanceButton } from '@/app/(private)/portfolio/_components/approve-allowance-form/button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { assetConfig } from '@/lib/config/assets';
import { ChevronDown } from 'lucide-react';
import type { Address } from 'viem';
import type { StableCoin } from './data';

export function ManageDropdown({ id, stableCoin, balance }: { id: Address; stableCoin: StableCoin; balance: number }) {
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
          <ApproveAllowanceButton
            address={id as Address}
            name={stableCoin.name}
            symbol={stableCoin.symbol}
            decimals={stableCoin.decimals}
            balance={balance}
            assetConfig={assetConfig.stablecoin}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
