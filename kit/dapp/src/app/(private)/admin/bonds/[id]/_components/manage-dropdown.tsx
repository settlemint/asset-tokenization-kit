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
import type { Bond } from './data';
import { MintButton } from './mint-form/button';
import { PauseButton } from './pause-form/button';
import { WithdrawExcessUnderlyingAssetsButton } from './withdraw-excess-underlying-asset-form/button';
import { WithdrawUnderlyingAssetsButton } from './withdraw-underlying-asset-form/button';

export function ManageDropdown({ id, bond }: { id: Address; bond: Bond }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          Manage
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-auto min-w-[280px] max-w-[320px] rounded-xl p-0 shadow-dropdown"
        side="bottom"
        sideOffset={5}
        align="end"
      >
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <MintButton address={id as Address} name={bond.name} symbol={bond.symbol} decimals={bond.decimals} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <BurnButton
            address={id as Address}
            name={bond.name}
            symbol={bond.symbol}
            decimals={bond.decimals}
            balance={Number(bond.holders.length > 0 ? (bond.holders[0].value ?? 0) : 0)}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <WithdrawUnderlyingAssetsButton
            address={id as Address}
            name={bond.name}
            symbol={bond.symbol}
            decimals={bond.decimals}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <WithdrawExcessUnderlyingAssetsButton address={id as Address} name={bond.name} symbol={bond.symbol} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <PauseButton address={id as Address} name={bond.name} symbol={bond.symbol} paused={bond.paused} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
