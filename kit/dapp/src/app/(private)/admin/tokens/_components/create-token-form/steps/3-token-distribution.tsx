import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { FileInput } from '@/components/blocks/form/controls/file-input';
import { TextInput } from '@/components/blocks/form/controls/text-input';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/auth/types';
import { shortHex } from '@/lib/hex';
import { SearchIcon } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';
import { TokenDistributionListInput } from './token-distribution-list-input';

type TokenUser = User & { tokenPermissions: string[] };

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

/**
 *  DialogListItem component
 */
const DialogListItem = ({ user }: { user: TokenUser }) => (
  <div className="DialogListItem flex items-center gap-2">
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
    <Button variant="outline" className="self-end">
      Add
    </Button>
  </div>
);

export const TokenDistribution = ({ form }: { form: UseFormReturn<CreateTokenSchemaType> }) => {
  return (
    <div>
      {/* Step 2 */}

      <CardTitle>Initial Token distribution</CardTitle>
      <CardDescription className="mt-2">
        Specify recipients and allocation for the initial token distribution. Add users manually or upload a file for
        bulk distribution.
      </CardDescription>

      {/* Token distribution */}
      <div className="flex flex-col gap-10">
        <TokenDistributionListInput selectionValues={users} control={form.control} />
        {/* Upload Recipients */}
        <div className="-mt-6">
          <FileInput
            control={form.control}
            name="uploadRecipients"
            description=""
            label="Add other recipients"
            text="Click, or drop your CSV file here"
            multiple={false}
            maxSize={1024 * 1024 * 10} // 10MB
            accept={{
              'text/*': ['.csv'],
            }}
            server={{
              bucket: 'default-bucket',
              storage: 'minio',
            }}
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="-mt-10">or</div>
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Add recipient(s) manually</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Select Recipient</DialogTitle>
                  <DialogDescription>
                    Enter a wallet address to send tokens directly, or search for a user by their name or email.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <TextInput
                      variant="icon"
                      control={form.control}
                      name="searchRecipientText"
                      className="col-span-3"
                      icon={<SearchIcon />}
                      placeholder="Enter address, name, or email"
                    />
                  </div>
                  <div className="">
                    {/* List component */}
                    <Label>Suggested</Label>
                    <ul>
                      {users.map((user, index) => (
                        <li className="DialogListItem my-6" key={user.id}>
                          <DialogListItem user={user as unknown as TokenUser} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};
