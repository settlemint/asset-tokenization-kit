import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
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
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { getAssetSearch } from "@/lib/queries/asset/asset-search";
import { cn } from "@/lib/utils";
import { CommandEmpty, useCommandState } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { FieldValues } from "react-hook-form";
import type { Address } from "viem";
import { EvmAddress } from "../../evm-address/evm-address";
import {
  getAriaAttributes,
  type BaseFormInputProps,
  type WithPlaceholderProps,
} from "./types";

type FormSearchSelectProps<T extends FieldValues> = BaseFormInputProps<T> &
  WithPlaceholderProps & {
    /** The default selected value */
    defaultValue?: string;
    onSelect?: (asset: Asset) => void;
  };

type Asset = UserAsset["asset"] & {
  holders: { value: number; account: { id: string } }[];
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
                    <EvmAddress address={field.value as Address} />
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
                  <MemoizedFormUsersList
                    onValueChange={field.onChange}
                    setOpen={setOpen}
                    value={field.value}
                    onSelect={(asset) => onSelect?.(asset as unknown as Asset)}
                  />
                </Command>
              </PopoverContent>
            </Popover>
            {description && (
              <FormDescription id={`${field.name}-description`}>
                {description}
              </FormDescription>
            )}
            <TranslatableFormFieldMessage
              id={`${field.name}-error`}
              aria-live="polite"
            />
          </FormItem>
        );
      }}
    />
  );
}

// Define the FormUsersList first, then the memoized components
function FormUsersList({
  onValueChange,
  setOpen,
  value,
  onSelect,
}: {
  onValueChange: (value: string) => void;
  setOpen: (open: boolean) => void;
  value: string;
  onSelect: (asset: UserAsset) => void;
}) {
  const search = (useCommandState((state) => state.search) || "") as string;
  const debounced = useDebounce<string>(search, 250);
  const [assets, setAssets] = useState<
    Awaited<ReturnType<typeof getAssetSearch>>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("components.form.assets");

  // Memoize the fetch function to prevent recreating it on every render
  const fetchAssets = useCallback(async () => {
    if (!debounced) {
      setAssets([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await getAssetSearch({ searchTerm: debounced });
      setAssets(results);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    let isMounted = true;

    async function executeFetch() {
      if (!isMounted) return;
      await fetchAssets();
    }

    void executeFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchAssets]);

  // Memoize the handler to prevent recreating it on every render
  const handleSelect = useCallback(
    (currentValue: string, asset: UserAsset) => {
      if (onSelect) {
        onSelect(asset);
      }
      onValueChange(currentValue);
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
      asset: { id: Address };
      value: string;
      onSelect: (currentValue: string) => void;
    }) => (
      <CommandItem
        key={asset.id}
        value={asset.id}
        onSelect={(currentValue) => onSelect(currentValue)}
      >
        <EvmAddress address={asset.id} hoverCard={false} />
        <Check
          className={cn(
            "ml-auto",
            value === asset.id ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    )
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
          onSelect={(currentValue) =>
            handleSelect(currentValue, asset as unknown as UserAsset)
          }
        />
      )),
    [assets, value, handleSelect, AssetItem]
  );

  return (
    <CommandList>
      <CommandEmpty className="pt-2 text-center text-muted-foreground text-sm">
        {isLoading ? t("loading") : t("no-asset-found")}
      </CommandEmpty>
      <CommandGroup>{memoizedAssetList}</CommandGroup>
    </CommandList>
  );
}

// Memoize the entire FormUsersList component
const MemoizedFormUsersList = memo(FormUsersList);
