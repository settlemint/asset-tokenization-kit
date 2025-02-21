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
import type { Equity } from './data';
import { MintButton } from './mint-form/button';
import { PauseButton } from './pause-form/button';

export function ManageDropdown({ id, equity }: { id: Address; equity: Equity }) {
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
          <MintButton address={id as Address} name={equity.name} symbol={equity.symbol} decimals={equity.decimals} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <BurnButton
            address={id as Address}
            name={equity.name}
            symbol={equity.symbol}
            decimals={equity.decimals}
            balance={Number(equity.holders.length > 0 ? (equity.holders[0].value ?? 0) : 0)}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <PauseButton address={id as Address} name={equity.name} symbol={equity.symbol} paused={equity.paused} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
