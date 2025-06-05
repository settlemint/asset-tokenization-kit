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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/lib/auth/types";
import type { Contact } from "@/lib/queries/contact/contact-schema";
import { cn } from "@/lib/utils";
import { CommandEmpty, useCommandState } from "cmdk";
import { Check, ChevronsUpDown, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import useSWR from "swr";
import { getAddress, type Address } from "viem";
import { EvmAddress } from "../../evm-address/evm-address";
import {
  getAriaAttributes,
  type BaseFormInputProps,
  type WithPlaceholderProps,
} from "./types";
// Define a type for recently selected users
type RecentUser = {
  wallet: Address;
  selectedAt: number;
};

const MAX_RECENT_USERS = 5;
const LOCAL_STORAGE_USERS_KEY = "recently-selected-users";
const LOCAL_STORAGE_CONTACTS_KEY = "recently-selected-contacts";

type FormSearchSelectProps<T extends FieldValues> = BaseFormInputProps<T> &
  WithPlaceholderProps & {
    /** The default selected value */
    defaultValue?: string;
    /** Filter users by role */
    role?: "admin" | "issuer" | "user";
    /** Filter users by allowed addresses */
    allowedAddresses?: Address[];
  };

export function FormUsers<T extends FieldValues>({
  label,
  description,
  required,
  placeholder,
  defaultValue,
  role,
  disabled,
  allowedAddresses,
  ...props
}: FormSearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("components.form.users");
  const defaultPlaceholder = t("default-placeholder");
  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role;

  const searchPlaceholder =
    userRole === "user"
      ? t("search-contact-placeholder")
      : t("search-placeholder");

  return (
    <FormField
      {...props}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        return (
          <FormItem className="flex flex-col space-y-1">
            {label && (
              <FormLabel
                className={cn(disabled && "cursor-not-allowed opacity-70")}
                htmlFor={field.name}
                id={`${field.name}-label`}
              >
                <span>{label}</span>
                {required && <span className="-ml-1 text-destructive">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  aria-expanded={open}
                  disabled={disabled}
                  className="w-full justify-between"
                  {...getAriaAttributes(
                    field.name,
                    !!fieldState.error,
                    disabled
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
                    placeholder={searchPlaceholder}
                    className="h-9"
                  />
                  <FormUsersList
                    onValueChange={field.onChange}
                    setOpen={setOpen}
                    value={field.value}
                    role={role}
                    allowedAddresses={allowedAddresses}
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

function FormUsersList({
  onValueChange,
  setOpen,
  value,
  role,
  allowedAddresses,
}: {
  onValueChange: (value: string) => void;
  setOpen: (open: boolean) => void;
  value: string;
  role?: "admin" | "issuer" | "user";
  allowedAddresses?: Address[];
}) {
  const search = useCommandState((state) => state.search) || "";
  const debounced = useDebounce<string>(search, 250);
  const t = useTranslations("components.form.users");
  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role;

  // Use different storage keys based on user role
  const storageKey =
    userRole === "user" ? LOCAL_STORAGE_CONTACTS_KEY : LOCAL_STORAGE_USERS_KEY;

  // Get recently selected users from local storage
  const [recentUsers, setRecentUsers] = useLocalStorage<RecentUser[]>(
    storageKey,
    []
  );

  const { data: users = [], isLoading } = useSWR(
    debounced ? [`user-search`, debounced, role] : null,
    async () => {
      // getUserSearch already filters based on user role
      // If user role is "user", it returns contacts
      // If user role is "admin" or "issuer", it returns all users
      const { data } = await apiClient.api.user.search.get({
        query: {
          term: debounced,
        },
      });
      return data || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );

  // Function to add a selected user to recent users
  const addToRecentUsers = (wallet: Address) => {
    setRecentUsers((currentRecentUsers) => {
      // Remove the user if already in the list
      const filteredUsers = currentRecentUsers.filter(
        (user) => user.wallet !== wallet
      );

      // Add the user to the beginning of the list
      const newRecentUsers = [
        { wallet, selectedAt: Date.now() },
        ...filteredUsers,
      ];

      // Limit the list to MAX_RECENT_USERS
      return newRecentUsers.slice(0, MAX_RECENT_USERS);
    });
  };

  // Handle selection of a user
  const handleSelect = (wallet: string) => {
    // Check if the address is allowed before selecting it
    if (!allowedAddresses || allowedAddresses.includes(getAddress(wallet))) {
      onValueChange(wallet);
      addToRecentUsers(getAddress(wallet));
      setOpen(false);
    }
  };

  // Prepare the heading text based on user role
  const recentHeading =
    userRole === "user" ? t("recent-contacts") : t("recent-users");

  // Filter recent users based on allowedAddresses
  const filteredRecentUsers = recentUsers.filter((user) =>
    allowedAddresses ? allowedAddresses.includes(getAddress(user.wallet)) : true
  );

  return (
    <CommandList>
      <CommandEmpty className="pt-2 text-center text-muted-foreground text-sm">
        {isLoading ? (
          <>
            <div className="flex flex-col space-y-2 px-2 py-1">
              <Skeleton className="h-6 w-full bg-muted/50" />
              <Skeleton className="h-6 w-full bg-muted/50" />
            </div>
          </>
        ) : userRole === "user" ? (
          t("no-contact-found")
        ) : (
          t("no-user-found")
        )}
      </CommandEmpty>

      {/* Show recent users when no search is entered */}
      {!debounced && filteredRecentUsers.length > 0 && (
        <CommandGroup heading={recentHeading}>
          {filteredRecentUsers.map((user) => (
            <CommandItem
              key={user.wallet}
              value={user.wallet}
              onSelect={handleSelect}
            >
              <History className="mr-2 h-4 w-4" />
              <EvmAddress address={user.wallet} hoverCard={false} />
              <Check
                className={cn(
                  "ml-auto",
                  value === user.wallet ? "opacity-100" : "opacity-0"
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {/* Show search results */}
      {(debounced || (!debounced && recentUsers.length === 0)) && (
        <CommandGroup>
          {users
            .filter((user: User | Contact) =>
              allowedAddresses
                ? allowedAddresses.includes(getAddress(user.wallet))
                : true
            )
            .map((user: User | Contact) => (
              <CommandItem
                key={user.wallet}
                value={user.wallet}
                onSelect={handleSelect}
              >
                <EvmAddress address={user.wallet} hoverCard={false} />
                <Check
                  className={cn(
                    "ml-auto",
                    value === user.wallet ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
        </CommandGroup>
      )}
    </CommandList>
  );
}
