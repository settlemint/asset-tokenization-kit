import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { MyAsset } from '@/components/blocks/my-assets-table/data';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { sanitizeSearchTerm } from '@/lib/react-query';
import { cn } from '@/lib/utils';
import { CommandEmpty, useCommandState } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { type Address, isHex } from 'viem';

interface AssetsSearchSelectProps {
  assets: MyAsset[];
  onSelect?: (asset: MyAsset) => void;
}

export function AssetsSearchSelect({ assets, onSelect }: AssetsSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Address | undefined>(undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-expanded={open} className="w-full justify-between">
          {selectedAsset ? <EvmAddress address={selectedAsset} /> : 'Select an asset'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search for an asset..." className="h-9" />
          <AssetSearchList
            assets={assets}
            onValueChange={(address) => {
              setSelectedAsset(address);
              const asset = assets.find((a) => a.asset.id === address);
              if (asset && onSelect) {
                onSelect(asset);
              }
            }}
            setOpen={setOpen}
            value={selectedAsset}
          />
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AssetSearchList({
  assets,
  onValueChange,
  setOpen,
  value,
}: {
  assets: MyAsset[];
  onValueChange: (value: Address) => void;
  setOpen: (open: boolean) => void;
  value?: Address;
}) {
  const search = useCommandState((state) => state.search);
  const debounced = useDebounce<string>(search, 250);

  const filteredAssets =
    debounced.trim() !== ''
      ? assets.filter((asset) => {
          const sanitizedSearch = sanitizeSearchTerm(debounced);
          const searchLower = sanitizedSearch.toLowerCase();

          return (
            asset.asset.name.toLowerCase().includes(searchLower) ||
            asset.asset.symbol.toLowerCase().includes(searchLower) ||
            (isHex(sanitizedSearch) && asset.asset.id.toLowerCase() === sanitizedSearch.toLowerCase())
          );
        })
      : assets;

  return (
    <CommandList>
      <CommandEmpty className="pt-2 text-center text-muted-foreground text-sm">No assets found.</CommandEmpty>
      <CommandGroup>
        {filteredAssets.map((asset) => (
          <CommandItem
            key={asset.asset.id}
            value={asset.asset.id}
            onSelect={(currentValue) => {
              onValueChange(currentValue as Address);
              setOpen(false);
            }}
          >
            <EvmAddress address={asset.asset.id as Address} hoverCard={false} />
            <Check className={cn('ml-auto', value === asset.asset.id ? 'opacity-100' : 'opacity-0')} />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
}
