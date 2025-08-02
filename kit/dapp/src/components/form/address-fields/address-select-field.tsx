import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "@/components/form/field";
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
import {
  useSearchAddresses,
  type AddressSearchScope,
} from "@/hooks/use-search-addresses";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useRecentCache } from "@/lib/hooks/use-recent-cache";
import { cn } from "@/lib/utils";
import { type EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import {
  Check,
  ChevronsUpDown,
  History,
  Search,
  SquareStack,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAddress } from "viem";

export interface AddressOption {
  address: EthereumAddress;
  displayName?: string;
  secondaryInfo?: string;
}

interface AddressSelectProps {
  label: string;
  scope: AddressSearchScope;
  description?: string;
  required?: boolean;
}

const MAX_RECENT_ADDRESSES = 5;
const SEARCH_DEBOUNCE_MS = 500;

export function AddressSelectField({
  label,
  description,
  scope,
  required = false,
}: AddressSelectProps) {
  const { t } = useTranslation("form");
  const field = useFieldContext<EthereumAddress>();
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, SEARCH_DEBOUNCE_MS);
  const { users, assets, isLoading } = useSearchAddresses({
    searchTerm,
    scope,
  });
  const searchResults = useMemo(() => {
    const addressList = scope === "user" ? users : assets;
    return addressList.map((item) => ({
      address: getAddress(item.id),
      displayName: item.name,
      secondaryInfo: "symbol" in item ? item.symbol : item.email,
    }));
  }, [scope, users, assets]);

  const { recentItems: recentAddresses, addItem: addToRecents } =
    useRecentCache<EthereumAddress>({
      storageKey: scope,
      maxItems: MAX_RECENT_ADDRESSES,
    });
  const recentAddressOptions = useMemo(() => {
    return recentAddresses.map((address) => ({
      address,
      displayName: undefined,
      secondaryInfo: undefined,
    }));
  }, [recentAddresses]);

  // Display addresses: search results, then initial
  const displayAddresses = useMemo(() => {
    if (searchTerm) {
      return searchResults;
    }

    return searchResults;
  }, [searchResults, searchTerm]);

  // Handle address selection from search results
  const handleAddressSelect = useCallback(
    (selectedAddress: EthereumAddress) => {
      field.handleChange(selectedAddress);
      addToRecents(selectedAddress);
      setOpen(false);
    },
    [field, addToRecents]
  );

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex-1 truncate text-left">
              {field.state.value ? (
                <Web3Address
                  address={field.state.value}
                  size="tiny"
                  showBadge={false}
                />
              ) : (
                <span className="text-muted-foreground">
                  {t("address.selectPlaceholder")}
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

              {!searchTerm && recentAddressOptions.length > 0 && (
                <CommandGroup
                  heading={
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 opacity-50" />
                      {t("address.recent")}
                    </div>
                  }
                >
                  {recentAddressOptions.map((option) => (
                    <AddressCommandItem
                      key={`recent-${option.address}`}
                      option={option}
                      isSelected={field.state.value === option.address}
                      onSelect={handleAddressSelect}
                      section="recent"
                    />
                  ))}
                </CommandGroup>
              )}

              {displayAddresses.length > 0 && (
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
                  {displayAddresses.map((option) => (
                    <AddressCommandItem
                      key={`all-${option.address}`}
                      option={option}
                      isSelected={field.state.value === option.address}
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
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}

const AddressCommandItem = memo(
  ({
    option,
    isSelected,
    onSelect,
    section,
  }: {
    option: AddressOption;
    isSelected: boolean;
    onSelect: (address: EthereumAddress) => void;

    section: string;
  }) => {
    return (
      <CommandItem
        value={section ? `${section}-${option.address}` : option.address}
        onSelect={() => {
          onSelect(option.address);
        }}
        className="flex items-center gap-2"
      >
        <Web3Address
          address={option.address}
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
