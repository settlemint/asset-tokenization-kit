import { TokenPermissionsListInput } from '@/components/blocks/form/controls/token-permissions-list-input';
import { CardDescription, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/auth/types';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';

// TODO: replace with admins within betterAuth organization scope
export const users = [
  {
    id: '1',
    name: 'Roderik van der Veer',
    email: 'roderik@settlemint.com',
    wallet: '0xC63572b8eb67c3dA33339489e2804cb2e61e8681',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    banned: false,
    role: 'admin',
    tokenPermissions: ['SUPPLIER', 'USER_MANAGER', 'TOKEN_MANAGER'],
  },
  {
    id: '2',
    name: 'Daan Poron',
    email: 'daan@settlemint.com',
    wallet: '0x41800A6d985C736942C098B54dC2a6508F05a1BB',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    banned: false,
    role: 'admin',
    tokenPermissions: ['SUPPLIER', 'USER_MANAGER'],
  },
  {
    id: '3',
    name: 'Daan Poron',
    email: 'daan@poron.be',
    wallet: '0xb3B8cd0f4cc9c55D518cbbcEE4A836fa0C72e530',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    banned: false,
    role: 'admin',
    tokenPermissions: ['SUPPLIER'],
  },
] as (User & { tokenPermissions: string[] })[];

export const TokenDistribution = ({ form }: { form: UseFormReturn<CreateTokenSchemaType> }) => {
  return (
    <div>
      {/* Step 2 */}

      <CardTitle>Initial Token distribution</CardTitle>
      <CardDescription>
        Specify recipients and allocation for the initial token distribution. Add users manually or upload a file for
        bulk distribution.
      </CardDescription>

      {/* Token permissions */}
      <div className="flex flex-col gap-10">
        <TokenPermissionsListInput users={users.slice(2)} selectionValues={users} control={form.control} />
      </div>
    </div>
  );
};
