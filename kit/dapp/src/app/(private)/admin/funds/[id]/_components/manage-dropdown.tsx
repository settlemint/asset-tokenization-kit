import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { Address } from 'viem';
import { BurnButton } from './burn-form/button';
import { CollectManagementFeeButton } from './collect-management-fee-form/button';
import type { Fund } from './data';
import { MintButton } from './mint-form/button';
import { PauseButton } from './pause-form/button';

export function ManageDropdown({ id, fund }: { id: Address; fund: Fund }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          Manage
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative right-10 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown">
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <MintButton address={id as Address} name={fund.name} symbol={fund.symbol} decimals={fund.decimals} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <BurnButton
            address={id as Address}
            name={fund.name}
            symbol={fund.symbol}
            decimals={fund.decimals}
            balance={Number(fund.holders.length > 0 ? (fund.holders[0].value ?? 0) : 0)}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <PauseButton address={id as Address} name={fund.name} symbol={fund.symbol} paused={fund.paused} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <CollectManagementFeeButton address={id as Address} name={fund.name} symbol={fund.symbol} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
