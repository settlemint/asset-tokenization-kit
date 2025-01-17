import type { CreateTokenSchemaType } from '@/app/(private)/admin/tokens/_components/create-token-form/create-token-form-schema';
import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { MultiSelectInput } from '@/components/blocks/form/controls/multi-select-input';
import { SelectInput } from '@/components/blocks/form/controls/select-input';
import { SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/auth/types';
import { shortHex } from '@/lib/hex';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type TokenUser = User & { tokenPermissions: string[] };

const tokenPermissions = [
  { value: 'TOKEN_MANAGER', label: 'Token Manager' },
  { value: 'USER_MANAGER', label: 'User Manager' },
  { value: 'SUPPLIER', label: 'Supplier' },
];

/**
 *  SelectOption component
 */
const SelectOption = ({ user }: { user: TokenUser }) => {
  return (
    <div className="SelectOption flex items-center gap-2">
      <AddressAvatar address={user.wallet} email={user.email} className="h-9 w-9 rounded-full" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        {user.name || user.email ? (
          <span className="truncate font-semibold">{user.name ?? user.email}</span>
        ) : (
          <Skeleton className="h-4 w-24" />
        )}
        {user.wallet ? (
          <span className="truncate text-xs">{shortHex(user.wallet, 12, 8)}</span>
        ) : (
          <Skeleton className="h-3 w-20" />
        )}
      </div>
    </div>
  );
};

/**
 *  ListItem component
 */
const ListItem = ({ user }: { user: TokenUser }) => {
  return (
    <div className="ListItem flex items-center gap-2">
      <AddressAvatar address={user?.wallet?.toString()} email={user?.email} className="h-9 w-9 rounded-full" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        {user?.name || user?.email ? (
          <span className="truncate font-semibold">{user?.name ?? user?.email}</span>
        ) : (
          <Skeleton className="h-4 w-24" />
        )}
        {user?.wallet ? (
          <span className="truncate text-muted-foreground text-xs">{shortHex(user?.wallet?.toString(), 12, 8)}</span>
        ) : (
          <Skeleton className="h-3 w-20" />
        )}
      </div>
    </div>
  );
};

/**
 * FormInput component
 */
export const TokenPermissionsListInput = ({
  users,
  selectionValues,
  control,
}: {
  users: TokenUser[];
  selectionValues: TokenUser[];
  control: UseFormReturn<CreateTokenSchemaType>['control'];
}) => {
  const [listItems, setListItems] = useState<TokenUser[]>(users);

  const [selectedValue, setSelectedValue] = useState<TokenUser | null>(null);

  function addItem() {
    if (selectedValue) {
      setListItems((prevItems) => {
        if (prevItems.find((user) => user.wallet === selectedValue.wallet)) {
          return prevItems;
        }
        return [...prevItems, selectedValue];
      });
    }
  }

  function removeItem(walletToRemove: string) {
    setListItems((prevItems) => prevItems.filter((user) => user.wallet !== walletToRemove));
  }

  return (
    <div className="ListComponent">
      {/* List component */}
      <ul>
        {listItems.map((user, index) => {
          return (
            <li className="ListItem my-6" key={user.wallet?.toString() + index}>
              <ListItem user={user as TokenUser} />
              <MultiSelectInput
                entries={tokenPermissions}
                name={`tokenPermissions.${index}.tokenPermissions`}
                control={control}
                zIndex={100 - index}
                onButtonClick={() => removeItem(user.wallet?.toString())}
                buttonIcon={<Minus size={12} strokeWidth={2} aria-hidden="true" color="hsl(var(--foreground))" />}
              />
            </li>
          );
        })}
      </ul>

      {/* Selection component */}
      <div className="SelectionComponent flex items-center gap-0">
        <SelectInput
          className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
          control={control}
          label="Add another admin:"
          name="admin"
          placeholder="Select an admin"
          onValueChange={(value) => {
            const selectedValue = selectionValues.find((user) => user.wallet === value);
            setSelectedValue(selectedValue ?? null);
          }}
        >
          {selectionValues.map((user) => (
            <SelectItem
              key={user.wallet}
              value={user.wallet}
              className="h-auto w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
            >
              <SelectOption user={user as TokenUser} />
            </SelectItem>
          ))}
        </SelectInput>
        <button
          type="button"
          className={`e inline-flex w-10 ${selectedValue ? 'h-[54px]' : 'h-[38px]'} items-center justify-center self-end rounded-e-lg border border-input bg-background text-muted-foreground/80 text-sm outline-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={() => {
            addItem();
          }}
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" color="hsl(var(--foreground))" />
        </button>
      </div>
    </div>
  );
};
