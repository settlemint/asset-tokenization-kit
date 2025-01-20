import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { MultiSelectInput } from '@/components/blocks/form/controls/multi-select-input';
import { SelectInput } from '@/components/blocks/form/controls/select-input';
import { SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/auth/types';
import { shortHex } from '@/lib/hex';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { type UseFormReturn, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';

type TokenUser = User & { tokenPermissions: string[] };

const TOKEN_PERMISSIONS = [
  { value: 'TOKEN_MANAGER', label: 'Token Manager' },
  { value: 'USER_MANAGER', label: 'User Manager' },
  { value: 'SUPPLIER', label: 'Supplier' },
];

/**
 *  SelectOption component
 */
const SelectOption = ({ user }: { user: TokenUser }) => (
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

/**
 *  ListItem component
 */
const ListItem = ({ user }: { user: TokenUser }) => (
  <div className="ListItem flex items-center gap-2">
    <AddressAvatar address={user.wallet?.toString()} email={user.email} className="h-9 w-9 rounded-full" />
    <div className="grid flex-1 text-left text-sm leading-tight">
      {user.name || user.email ? (
        <span className="truncate font-semibold">{user.name ?? user.email}</span>
      ) : (
        <Skeleton className="h-4 w-24" />
      )}
      {user.wallet ? (
        <span className="truncate text-muted-foreground text-xs">{shortHex(user.wallet?.toString(), 12, 8)}</span>
      ) : (
        <Skeleton className="h-3 w-20" />
      )}
    </div>
  </div>
);

/**
 * FormInput component
 */
export const TokenPermissionsListInput = ({
  selectionValues,
  control,
}: {
  selectionValues: TokenUser[];
  control: UseFormReturn<CreateTokenSchemaType>['control'];
}) => {
  const { setValue, getValues } = useFormContext<CreateTokenSchemaType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tokenPermissions',
  });
  const [selectKey, setSelectKey] = useState(0);
  const admin = useWatch({ control, name: 'admin' });

  const handleAddUser = () => {
    if (!admin) {
      return;
    }

    const selectedUser = selectionValues.find((user) => user.wallet === admin);
    if (!selectedUser) {
      return;
    }

    const currentFields = getValues('tokenPermissions') || [];
    const exists = currentFields.some((field) => field.wallet === selectedUser.wallet);
    if (exists) {
      return;
    }

    append({
      id: selectedUser.id,
      wallet: selectedUser.wallet,
      email: selectedUser.email,
      name: selectedUser.name,
      tokenPermissions: [] as string[],
    });

    setValue('admin', '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setSelectKey((prev) => prev + 1);
  };

  return (
    <div className="ListComponent">
      {/* List component */}
      <ul>
        {fields.map((field, index) => (
          <li className="ListItem my-6" key={field.id}>
            <ListItem user={field as unknown as TokenUser} />
            <MultiSelectInput
              entries={TOKEN_PERMISSIONS}
              name={`tokenPermissions.${index}.tokenPermissions`}
              control={control}
              zIndex={100 - index}
              onButtonClick={() => remove(index)}
              buttonIcon={<Minus size={12} strokeWidth={2} aria-hidden="true" color="hsl(var(--foreground))" />}
            />
          </li>
        ))}
      </ul>

      {/* Selection component */}
      <div className="SelectionComponent mt-8 flex items-center gap-0">
        <SelectInput
          key={selectKey}
          className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
          control={control}
          label="Add another admin:"
          name="admin"
          placeholder="Select an admin"
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
          className={`inline-flex w-10 ${admin ? 'h-[54px]' : 'h-[38px]'} items-center justify-center self-end rounded-e-lg border border-input bg-background text-muted-foreground/80 text-sm outline-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={handleAddUser}
          disabled={!admin}
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" color="hsl(var(--foreground))" />
        </button>
      </div>
    </div>
  );
};
