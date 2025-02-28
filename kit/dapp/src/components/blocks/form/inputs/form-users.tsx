import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { getUserSearch } from '@/lib/queries/user/user-search';
import { cn } from '@/lib/utils';
import { CommandEmpty, useCommandState } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { Address } from 'viem';
import { EvmAddress } from '../../evm-address/evm-address';
import type { BaseFormInputProps, WithPlaceholderProps } from './types';

type FormSearchSelectProps<T extends FieldValues> = BaseFormInputProps<T> &
  WithPlaceholderProps & {
    /** The default selected value */
    defaultValue?: string;
  };

// Define a type for user objects based on the expected structure
interface User {
  wallet: Address;
  name?: string;
  email?: string;
}

export function FormUsers<T extends FieldValues>({
  label,
  description,
  required,
  placeholder,
  defaultValue,
  ...props
}: FormSearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('components.form.users');
  const defaultPlaceholder = t('default-placeholder');

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
                <Button
                  variant="outline"
                  aria-expanded={open}
                  className="w-full justify-between"
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
                    placeholder={t('search-placeholder')}
                    className="h-9"
                  />
                  <FormUsersList
                    onValueChange={field.onChange}
                    setOpen={setOpen}
                    value={field.value}
                  />
                </Command>
              </PopoverContent>
            </Popover>
            {description && (
              <FormDescription id={`${field.name}-description`}>
                {description}
              </FormDescription>
            )}
            <FormMessage id={`${field.name}-error`} aria-live="polite" />
          </FormItem>
        );
      }}
    />
  );
}

function FormUsersList({
  onValueChange,
  setOpen,
  value,
}: {
  onValueChange: (value: string) => void;
  setOpen: (open: boolean) => void;
  value: string;
}) {
  const search = (useCommandState((state) => state.search) || '') as string;
  const debounced = useDebounce<string>(search, 250);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('components.form.users');

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      if (!debounced) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getUserSearch({ searchTerm: debounced });
        if (isMounted) {
          setUsers(results as User[]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        if (isMounted) {
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [debounced]);

  return (
    <CommandList>
      <CommandEmpty className="pt-2 text-center text-muted-foreground text-sm">
        {isLoading ? t('loading') : t('no-user-found')}
      </CommandEmpty>
      <CommandGroup>
        {users.map((user) => (
          <CommandItem
            key={user.wallet}
            value={user.wallet}
            onSelect={(currentValue) => {
              onValueChange(currentValue);
              setOpen(false);
            }}
          >
            <EvmAddress address={user.wallet} hoverCard={false} />
            <Check
              className={cn(
                'ml-auto',
                value === user.wallet ? 'opacity-100' : 'opacity-0'
              )}
            />
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
}
