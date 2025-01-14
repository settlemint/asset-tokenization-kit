import type { CreateTokenSchemaType } from '@/app/(private)/admin/tokens/_components/create-token-form/create-token-form-schema';
import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { MultiSelectInput } from '@/components/blocks/form/controls/multi-select-input';
import { SelectInput } from '@/components/blocks/form/controls/select-input';
import { SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/auth/types';
import { shortHex } from '@/lib/hex';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const tokenPermissions = [
  { value: 'ADMIN', label: 'Token Manager' },
  { value: 'USER_MANAGER', label: 'User Manager' },
  { value: 'SUPPLIER', label: 'Supplier' },
];

export const TokenPermissionsInput = ({
  users,
  selectionValues,
  control,
}: {
  users: User[];
  selectionValues: User[];
  control: UseFormReturn<CreateTokenSchemaType>['control'];
}) => {
  const [_users, setUsers] = useState<User[]>(users);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  function addUser() {
    if (selectedUser) {
      setUsers((prevUsers) => {
        if (prevUsers.find((user) => user.wallet === selectedUser.wallet)) {
          return prevUsers;
        }
        return [...prevUsers, selectedUser];
      });
    }
  }

  return (
    <div>
      <ul>
        {_users.map((user, index) => (
          <li className="RepeatItem my-6" key={user.wallet?.toString() + index}>
            <div className="User flex items-center gap-2">
              <AddressAvatar address={user?.wallet?.toString()} email={user?.email} className="h-9 w-9 rounded-full" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                {user?.name || user?.email ? (
                  <span className="truncate font-semibold">{user?.name ?? user?.email}</span>
                ) : (
                  <Skeleton className="h-4 w-24" />
                )}
                {user?.wallet ? (
                  <span className="truncate text-muted-foreground text-xs">
                    {shortHex(user?.wallet?.toString(), 12, 8)}
                  </span>
                ) : (
                  <Skeleton className="h-3 w-20" />
                )}
              </div>
            </div>
            <MultiSelectInput
              entries={tokenPermissions}
              name="tokenPermissions"
              control={control}
              zIndex={100 - index}
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-20">
        <SelectInput
          label="Add another admin:"
          name="admin"
          control={control}
          placeholder="Select an admin"
          onValueChange={(value) => {
            console.log('onValueChange', value);
            const selectedUser = selectionValues.find((user) => user.wallet === value);
            setSelectedUser(selectedUser ?? null);
          }}
        >
          {selectionValues.map((user: User) => (
            <SelectItem
              key={user.wallet}
              value={user.wallet}
              className="h-auto w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
            >
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
            </SelectItem>
          ))}
        </SelectInput>
        <button
          type="button"
          className="mt-6 cursor-pointer rounded-full border border-dotted p-2"
          onClick={() => {
            addUser();
          }}
        >
          <Plus className="h-4 w-4" color="hsl(var(--foreground))" />
        </button>
      </div>
    </div>
  );
};
