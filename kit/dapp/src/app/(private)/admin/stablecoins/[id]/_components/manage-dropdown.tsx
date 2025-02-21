import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ChevronDown } from 'lucide-react';
import type { Address } from 'viem';
import { AddTokenAdminButton } from './add-token-admin-form/button';
import { BurnButton } from './burn-form/button';
import type { StableCoin } from './data';
import { MintButton } from './mint-form/button';
import { PauseButton } from './pause-form/button';
import { UpdateCollateralButton } from './update-collateral-form/button';

export function ManageDropdown({ id, stableCoin }: { id: Address; stableCoin: StableCoin }) {
  const collateralAvailable = Number(stableCoin?.collateral ?? 0) - Number(stableCoin?.totalSupply ?? 0);

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
          <MintButton
            address={id as Address}
            name={stableCoin.name}
            symbol={stableCoin.symbol}
            decimals={stableCoin.decimals}
            disabled={collateralAvailable <= 0}
            collateralAvailable={collateralAvailable}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <BurnButton
            address={id as Address}
            name={stableCoin.name}
            symbol={stableCoin.symbol}
            decimals={stableCoin.decimals}
            balance={stableCoin.holders.length > 0 ? (stableCoin.holders[0].value ?? '0') : '0'}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <PauseButton
            address={id as Address}
            name={stableCoin.name}
            symbol={stableCoin.symbol}
            paused={stableCoin.paused}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <UpdateCollateralButton
            address={id as Address}
            name={stableCoin.name}
            symbol={stableCoin.symbol}
            decimals={stableCoin.decimals}
          />
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <AddTokenAdminButton address={id as Address} name={stableCoin.name} symbol={stableCoin.symbol} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
