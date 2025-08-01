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
import { useFieldContext } from "@/hooks/use-form-contexts";
import { useSearchAddresses } from "@/hooks/use-search-addresses";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useRecentCache } from "@/lib/hooks/use-recent-cache";
import { cn } from "@/lib/utils";
import { type EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { Check, ChevronsUpDown, History, Pencil } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { getAddress } from "viem";
import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "../field";
import { AddressInput } from "./address-input";

export interface AddressOption {
  address: EthereumAddress;
  displayName?: string;
  secondaryInfo?: string;
}

interface BaseAddressFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  scope: "user" | "asset";
  recentStorageKey: string;
  addressTypeName: string;
}

const MAX_RECENT_ADDRESSES = 5;
const INITIAL_ADDRESSES_COUNT = 5;
const SEARCH_DEBOUNCE_MS = 500;

export function BaseAddressField({
  label,
  description,
  required = false,
  placeholder,
  disabled = false,
  scope,
  recentStorageKey,
  addressTypeName,
}: BaseAddressFieldProps) {
  const field = useFieldContext<EthereumAddress>();
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Use the recent cache hook for managing recent addresses
  const { recentItems: recentAddresses, addItem: addToRecents } =
    useRecentCache<EthereumAddress>({
      storageKey: recentStorageKey,
      maxItems: MAX_RECENT_ADDRESSES,
    });

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, SEARCH_DEBOUNCE_MS);

  const { users, assets, isLoading } = useSearchAddresses({
    searchTerm,
    scope,
  });

  const addresses = useMemo(() => {
    const addressList = scope === "user" ? users : assets;
    return addressList.map((item) => ({
      address: getAddress(item.id),
      displayName: item.name,
      secondaryInfo: "symbol" in item ? item.symbol : item.email,
    }));
  }, [scope, users, assets]);

  // Convert recent addresses to AddressOption format
  const recentAddressOptions = useMemo(() => {
    return recentAddresses.map((address) => ({
      address,
      displayName: undefined,
      secondaryInfo: undefined,
    }));
  }, [recentAddresses]);

  // Display addresses: recent first, then search results, then initial if no recents
  const displayAddresses = useMemo(() => {
    if (searchTerm) {
      return addresses;
    }

    if (recentAddressOptions.length > 0) {
      return recentAddressOptions;
    }

    // Show first 5 addresses as initial list
    return addresses.slice(0, INITIAL_ADDRESSES_COUNT);
  }, [addresses, recentAddressOptions, searchTerm]);

  // Handle address selection from search results
  const handleAddressSelect = useCallback(
    (selectedAddress: EthereumAddress) => {
      field.handleChange(selectedAddress);
      addToRecents(selectedAddress);
      setOpen(false);
    },
    [field, addToRecents]
  );

  // Switch to manual mode
  const switchToManualMode = useCallback(() => {
    setManualMode(true);
    setOpen(false);
  }, []);

  // Switch to search mode
  const switchToSearchMode = useCallback(() => {
    setManualMode(false);
  }, []);

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  const defaultPlaceholder = `Select or enter ${addressTypeName} address`;

  if (manualMode) {
    return (
      <div>
        <AddressInput
          value={field.state.value}
          label={label}
          description={description}
          required={required}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={switchToSearchMode}>
            Search for address instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex-1 truncate text-left">
              {field.state.value ? (
                <Web3Address
                  address={field.state.value}
                  size="small"
                  showBadge={false}
                />
              ) : (
                <span className="text-muted-foreground">
                  {placeholder || defaultPlaceholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${addressTypeName} addresses`}
              onValueChange={debouncedSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No matching address found"}
              </CommandEmpty>

              {!searchTerm && recentAddressOptions.length > 0 && (
                <CommandGroup heading="Recent">
                  {recentAddressOptions.map((option) => (
                    <AddressCommandItem
                      key={option.address}
                      option={option}
                      isSelected={field.state.value === option.address}
                      onSelect={handleAddressSelect}
                      showIcon={true}
                    />
                  ))}
                </CommandGroup>
              )}

              <CommandGroup
                heading={
                  searchTerm
                    ? "Search Results"
                    : recentAddressOptions.length > 0
                      ? "All Addresses"
                      : `${addressTypeName.charAt(0).toUpperCase() + addressTypeName.slice(1)} Addresses`
                }
              >
                {displayAddresses.map((option) => (
                  <AddressCommandItem
                    key={option.address}
                    option={option}
                    isSelected={field.state.value === option.address}
                    onSelect={handleAddressSelect}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="border-t px-2 py-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={switchToManualMode}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
        >
          <Pencil className="mr-2 h-3 w-3" />
          Enter address manually instead
        </Button>
      </div>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}

// Memoized command item component
const AddressCommandItem = memo(
  ({
    option,
    isSelected,
    onSelect,
    showIcon = false,
  }: {
    option: AddressOption;
    isSelected: boolean;
    onSelect: (address: EthereumAddress) => void;
    showIcon?: boolean;
  }) => {
    return (
      <CommandItem
        value={option.address}
        onSelect={() => {
          onSelect(option.address);
        }}
        className="flex items-center gap-2"
      >
        {showIcon && <History className="h-4 w-4 opacity-50" />}
        <Web3Address
          address={option.address}
          size="small"
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
