import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Web3Address } from "@/components/web3/web3-address";
import {
  type AddressSearchScope,
  useSearchAddresses,
} from "@/hooks/use-search-addresses";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useRecentCache } from "@/lib/hooks/use-recent-cache";
import { cn } from "@/lib/utils";
import type { EthereumAddress } from "@atk/zod/validators/ethereum-address";
import {
  Check,
  ChevronsUpDown,
  History,
  Search,
  SquareStack,
} from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface AddressSelectProps {
  value: EthereumAddress | undefined;
  onChange: (address: EthereumAddress) => void;
  scope: AddressSearchScope;
  placeholder?: string;
  className?: string;
}

const MAX_RECENT_ADDRESSES = 5;
const SEARCH_DEBOUNCE_MS = 500;

export function AddressSelect({
  value,
  onChange,
  scope,
  placeholder,
  className,
}: AddressSelectProps) {
  const { t } = useTranslation("form");
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, SEARCH_DEBOUNCE_MS);
  const { searchResults, isLoading } = useSearchAddresses({
    searchTerm,
    scope,
  });

  const { recentItems: recentAddresses, addItem: addToRecents } =
    useRecentCache<EthereumAddress>({
      storageKey: scope,
      maxItems: MAX_RECENT_ADDRESSES,
    });

  // Handle address selection from search results
  const handleAddressSelect = useCallback(
    (selectedAddress: EthereumAddress) => {
      onChange(selectedAddress);
      addToRecents(selectedAddress);
      setOpen(false);
    },
    [onChange, addToRecents]
  );

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex-1 truncate text-left">
            {value ? (
              <Web3Address address={value} size="tiny" showBadge={false} />
            ) : (
              <span className="text-muted-foreground">
                {placeholder || t("address.selectPlaceholder")}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("address.searchPlaceholder")}
            onValueChange={debouncedSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? t("address.loading")
                : searchTerm
                  ? t("address.noResults")
                  : t("address.noAddressesCreated")}
            </CommandEmpty>

            {!searchTerm && recentAddresses.length > 0 && (
              <CommandGroup
                heading={
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 opacity-50" />
                    {t("address.recent")}
                  </div>
                }
              >
                {recentAddresses.map((address) => (
                  <AddressCommandItem
                    key={`recent-${address}`}
                    address={address}
                    isSelected={value === address}
                    onSelect={handleAddressSelect}
                    section="recent"
                  />
                ))}
              </CommandGroup>
            )}

            {searchResults.length > 0 && (
              <CommandGroup
                heading={
                  <>
                    {searchTerm && (
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 opacity-50" />
                        {t("address.searchResults")}
                      </div>
                    )}
                    {!searchTerm && (
                      <div className="flex items-center gap-2">
                        <SquareStack className="h-4 w-4 opacity-50" />
                        {t("address.allAddresses")}
                      </div>
                    )}
                  </>
                }
              >
                {searchResults.map((address) => (
                  <AddressCommandItem
                    key={`all-${address}`}
                    address={address}
                    isSelected={value === address}
                    onSelect={handleAddressSelect}
                    section="all"
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const AddressCommandItem = memo(
  ({
    address,
    isSelected,
    onSelect,
    section,
  }: {
    address: EthereumAddress;
    isSelected: boolean;
    onSelect: (address: EthereumAddress) => void;
    section: string;
  }) => {
    return (
      <CommandItem
        value={section ? `${section}-${address}` : address}
        onSelect={() => {
          onSelect(address);
        }}
        className="flex items-center gap-2"
      >
        <Web3Address
          address={address}
          size="tiny"
          showBadge={false}
          className="flex-1"
        />
        <Check
          className={cn(
            "ml-auto h-4 w-4",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    );
  }
);

AddressCommandItem.displayName = "AddressCommandItem";
