import type { BaseFormInputProps, WithPlaceholderProps } from '@/components/blocks/asset-form/asset-form-types';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { queryKeys, sanitizeSearchTerm } from '@/lib/react-query';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { cn } from '@/lib/utils';
import type { ResultOf } from '@settlemint/sdk-hasura';
import { useQuery } from '@tanstack/react-query';
import { CommandEmpty, CommandLoading, useCommandState } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { Address } from 'viem';
import { EvmAddress } from '../../evm-address/evm-address';

type AssetFormSearchSelectProps<T extends FieldValues> = BaseFormInputProps<T> &
  WithPlaceholderProps & {
    /** The default selected value */
    defaultValue?: string;
  };

const SearchUsers = hasuraGraphql(`
  query SearchUsers($search: String!) {
    user(limit: 10, where: {_or: [{name: {_ilike: $search}}, {wallet: {_ilike: $search}}, {email: {_like: $search}}]}) {
      wallet
      id
    }
  }
`);

/**
 * A form select component that wraps shadcn's Select component with form field functionality.
 * Provides a dropdown selection with support for default values and custom options.
 *
 * @example
 * ```tsx
 * <AssetFormSelect
 *   name="category"
 *   control={form.control}
 *   label="Category"
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' },
 *   ]}
 *   required
 * />
 * ```
 */
export function AssetFormUsers<T extends FieldValues>({
  label,
  description,
  required,
  placeholder = 'Select an option',
  className,
  defaultValue,
  ...props
}: AssetFormSearchSelectProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      {...props}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        return (
          <FormItem>
            {label && (
              <FormLabel
                className={cn(
                  fieldState.error && 'text-destructive',
                  props.disabled && 'cursor-not-allowed opacity-70'
                )}
                htmlFor={field.name}
                id={`${field.name}-label`}
              >
                <span>{label}</span>
                {required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" aria-expanded={open} className="w-full justify-between">
                  {field.value ? <EvmAddress address={field.value as Address} /> : placeholder}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[419px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search framework..." className="h-9" />
                  <AssetFormUsersList onValueChange={field.onChange} setOpen={setOpen} value={field.value} />
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription id={`${field.name}-description`}>{description}</FormDescription>}
            <FormMessage id={`${field.name}-error`} aria-live="polite" />
          </FormItem>
        );
      }}
    />
  );
}

function AssetFormUsersList({
  onValueChange,
  setOpen,
  value,
}: { onValueChange: (value: string) => void; setOpen: (open: boolean) => void; value: string }) {
  const search = useCommandState((state) => state.search);
  const debounced = useDebounce<string>(search, 250);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.search(debounced),
    enabled: debounced.trim() !== '',
    queryFn: async () => {
      const sanitizedSearch = sanitizeSearchTerm(debounced);

      const users: ResultOf<typeof SearchUsers>['user'] = [];

      const searchUsers = await hasuraClient.request(SearchUsers, {
        search: `%${sanitizedSearch}%`,
      });
      users.push(...searchUsers.user);

      return users;
    },
  });

  return (
    <CommandList>
      {isLoading && <CommandLoading>Searching...</CommandLoading>}
      <CommandEmpty>No user found.</CommandEmpty>
      <CommandGroup>
        {data?.map((user) => (
          <CommandItem
            key={user.wallet}
            value={user.wallet}
            onSelect={(currentValue) => {
              onValueChange(currentValue);
              setOpen(false);
            }}
          >
            <EvmAddress address={user.wallet as Address} hoverCard={false} />
            <Check className={cn('ml-auto', value === user.wallet ? 'opacity-100' : 'opacity-0')} />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
}
