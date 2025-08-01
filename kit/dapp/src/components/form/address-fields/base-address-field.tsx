import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Web3Address } from "@/components/web3/web3-address";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";
import {
  type EthereumAddress,
  ethereumAddress,
} from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, History, Pencil, Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { getAddress } from "viem";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "../field";

export interface AddressOption {
  address: EthereumAddress;
  displayName?: string;
  secondaryInfo?: string;
}

interface RecentAddress {
  address: EthereumAddress;
  selectedAt: number;
}

interface BaseAddressFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  mode: "user" | "asset";
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
  mode,
  recentStorageKey,
  addressTypeName,
}: BaseAddressFieldProps) {
  const field = useFieldContext<EthereumAddress>();
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  // Load recent addresses from localStorage
  const [recentAddresses, setRecentAddresses] = useState<RecentAddress[]>(
    () => {
      if (globalThis.window === undefined) return [];
      try {
        const stored = localStorage.getItem(recentStorageKey);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
  );

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, SEARCH_DEBOUNCE_MS);

  // Query for addresses based on search term
  const { data: userAddresses = [], isLoading: isUserAddressesLoading } =
    useQuery(
      orpc.user.list.queryOptions({
        enabled: mode === "user",
        input: {
          searchByAddress: searchTerm.length > 0 ? searchTerm : undefined,
        },
        staleTime: 1000 * 60 * 30, // Cache user data for 30 minutes as it rarely changes
      })
    );

  const { data: assetAddresses = [], isLoading: isAssetAddressesLoading } =
    useQuery(
      orpc.token.list.queryOptions({
        enabled: mode === "asset",
        input: {
          searchByAddress: searchTerm.length > 0 ? searchTerm : undefined,
        },
        staleTime: 1000 * 60 * 30, // Cache token data for 30 minutes as it rarely changes
      })
    );

  const addresses = useMemo(() => {
    const addresses = mode === "user" ? userAddresses : assetAddresses;
    return addresses.map((address) => ({
      address: getAddress(address.id),
      displayName: address.name,
      secondaryInfo: "symbol" in address ? address.symbol : address.email,
    }));
  }, [mode, userAddresses, assetAddresses]);

  const isLoading = useMemo(() => {
    if (mode === "user") {
      return isUserAddressesLoading;
    }
    return isAssetAddressesLoading;
  }, [mode, isUserAddressesLoading, isAssetAddressesLoading]);

  // Get recent addresses that still exist in the system
  const recentAddressOptions = useMemo(() => {
    return recentAddresses
      .sort((a, b) => b.selectedAt - a.selectedAt)
      .slice(0, MAX_RECENT_ADDRESSES)
      .map((recent) => ({
        address: recent.address,
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

  // Add address to recent selections
  const addToRecents = useCallback(
    (address: EthereumAddress) => {
      const newRecent: RecentAddress = {
        address,
        selectedAt: Date.now(),
      };

      setRecentAddresses((prev) => {
        const filtered = prev.filter((item) => item.address !== address);
        const updated = [newRecent, ...filtered].slice(0, MAX_RECENT_ADDRESSES);

        // Save to localStorage
        try {
          localStorage.setItem(recentStorageKey, JSON.stringify(updated));
        } catch {
          // Ignore localStorage errors
        }

        return updated;
      });
    },
    [recentStorageKey]
  );

  // Handle address selection from search results
  const handleAddressSelect = useCallback(
    (selectedAddress: EthereumAddress) => {
      field.handleChange(selectedAddress);
      addToRecents(selectedAddress);
      setOpen(false);
    },
    [field, addToRecents]
  );

  // Handle manual input validation and submission
  const validateManualInput = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setManualError(null);
        return;
      }

      const result = ethereumAddress.safeParse(input);
      if (result.success) {
        setManualError(null);
        field.handleChange(result.data);
        addToRecents(result.data);
      } else {
        setManualError(result.error.issues[0]?.message || "Invalid address");
      }
    },
    [field, addToRecents]
  );

  // Handle manual input changes
  const handleManualInputChange = useCallback(
    (value: string) => {
      setManualInput(value);
      validateManualInput(value);
    },
    [validateManualInput]
  );

  // Switch to manual mode
  const switchToManualMode = useCallback(() => {
    setManualMode(true);
    setOpen(false);
    setManualInput(field.state.value || "");
  }, [field.state.value]);

  // Switch to search mode
  const switchToSearchMode = useCallback(() => {
    setManualMode(false);
    setManualInput("");
    setManualError(null);
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
      <FieldLayout>
        <FieldLabel htmlFor={field.name} label={label} required={required} />
        <FieldDescription description={description} />
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id={field.name}
              type="text"
              value={manualInput}
              onChange={(e) => {
                handleManualInputChange(e.target.value);
              }}
              placeholder="0x..."
              className={cn(
                errorClassNames(field.state.meta),
                manualError && "border-destructive"
              )}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={switchToSearchMode}
              disabled={disabled}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {manualError && (
            <p className="text-sm text-destructive">{manualError}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={switchToSearchMode}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            ← Switch to search mode
          </Button>
        </div>
        <FieldErrors {...field.state.meta} />
      </FieldLayout>
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
              placeholder={`Search ${addressTypeName} addresses...`}
              onValueChange={debouncedSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading
                  ? "Loading..."
                  : `No ${addressTypeName} addresses found`}
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
