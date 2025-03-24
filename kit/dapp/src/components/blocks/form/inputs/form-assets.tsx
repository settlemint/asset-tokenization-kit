import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { getAssetSearch } from "@/lib/queries/asset/asset-search";
import type { AssetUsers } from "@/lib/queries/asset/asset-users-schema";
import { cn } from "@/lib/utils";
import { CommandEmpty, useCommandState } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useState } from "react";
import type { FieldValues } from "react-hook-form";
import useSWR from "swr";
import type { Address } from "viem";
import { EvmAddress } from "../../evm-address/evm-address";
import {
  type BaseFormInputProps,
  type WithPlaceholderProps,
  getAriaAttributes,
} from "./types";

type FormSearchSelectProps<T extends FieldValues> = BaseFormInputProps<T> &
  WithPlaceholderProps & {
    /** The default selected value */
    defaultValue?: AssetUsers;
    onSelect?: (asset: AssetUsers) => void;
  };

export function FormAssets<T extends FieldValues>({
  label,
  description,
  required,
  placeholder,
  defaultValue,
  onSelect,
  ...props
}: FormSearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("components.form.assets");
  const defaultPlaceholder = t("default-placeholder");

  return (
    <FormField
      {...props}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        return (
          <FormItem className="flex flex-col space-y-1">
            {label && (
              <FormLabel
                className={cn(
                  props.disabled && "cursor-not-allowed opacity-70"
                )}
                htmlFor={field.name}
                id={`${field.name}-label`}
              >
                <span>{label}</span>
                {required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  aria-expanded={open}
                  className="w-full justify-between"
                  {...getAriaAttributes(
                    field.name,
                    !!fieldState.error,
                    props.disabled
                  )}
                >
                  {field.value ? (
                    <EvmAddress address={field.value.id} />
                  ) : (
                    placeholder || defaultPlaceholder
                  )}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t("search-placeholder")}
                    className="h-9"
                  />
                  <MemoizedFormAssetsList
                    onValueChange={field.onChange}
                    setOpen={setOpen}
                    value={field.value}
                    onSelect={(asset) => onSelect?.(asset)}
                  />
                </Command>
              </PopoverContent>
            </Popover>
            {description && (
              <FormDescription id={`${field.name}-description`}>
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Define the FormUsersList first, then the memoized components
function FormAssetsList({
  onValueChange,
  setOpen,
  value,
  onSelect,
}: {
  value?: AssetUsers;
  onValueChange: (value: AssetUsers) => void;
  onSelect: (asset: AssetUsers) => void;
  setOpen: (open: boolean) => void;
}) {
  const search = useCommandState((state) => state.search) || "";
  const debounced = useDebounce<string>(search, 250);
  const t = useTranslations("components.form.assets");

  // Use SWR for data fetching with caching
  const { data: assets = [], isLoading } = useSWR(
    debounced ? [`asset-search`, debounced] : null,
    async () => {
      if (!debounced) return [];
      return getAssetSearch({ searchTerm: debounced });
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );

  // Memoize the handler to prevent recreating it on every render
  const handleSelect = useCallback(
    (_currentValue: string, asset: AssetUsers) => {
      if (onSelect) {
        onSelect(asset);
      }
      onValueChange(asset);
      setOpen(false);
    },
    [onValueChange, setOpen, onSelect]
  );

  // Memoized asset item component to prevent re-renders
  const AssetItem = memo(
    ({
      asset,
      value,
      onSelect,
    }: {
      asset: AssetUsers;
      value?: AssetUsers;
      onSelect: (currentValue: Address) => void;
    }) => {
      const isSelected = value?.id === asset.id;

      return (
        <CommandItem
          key={asset.id}
          onSelect={(currentValue) => onSelect(currentValue as Address)}
        >
          <EvmAddress address={asset.id} hoverCard={false} />
          <Check
            className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
          />
        </CommandItem>
      );
    }
  );

  AssetItem.displayName = "AssetItem";

  // Memoize the asset list to prevent unnecessary re-renders
  const memoizedAssetList = useMemo(
    () =>
      assets.map((asset) => (
        <AssetItem
          key={asset.id}
          asset={asset}
          value={value}
          onSelect={(currentValue) => handleSelect(currentValue, asset)}
        />
      )),
    [assets, value, handleSelect]
  );

  return (
    <CommandList>
      <CommandEmpty className="pt-2 text-center text-muted-foreground text-sm">
        {isLoading ? (
          <div className="flex flex-col space-y-2 px-2 py-1">
            <Skeleton className="h-6 w-full bg-muted/50" />
            <Skeleton className="h-6 w-full bg-muted/50" />
          </div>
        ) : (
          t("no-asset-found")
        )}
      </CommandEmpty>
      <CommandGroup>{memoizedAssetList}</CommandGroup>
    </CommandList>
  );
}

// Memoize the entire FormUsersList component
const MemoizedFormAssetsList = memo(FormAssetsList);
