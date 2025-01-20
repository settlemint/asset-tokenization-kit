import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { NumericInput } from '@/components/blocks/form/controls/numeric-input';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/auth/types';
import { shortHex } from '@/lib/hex';
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
export const TokenDistributionListInput = ({
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
            <NumericInput name={`tokenDistribution.${index}.amount`} control={control} />
          </li>
        ))}
      </ul>
    </div>
  );
};
