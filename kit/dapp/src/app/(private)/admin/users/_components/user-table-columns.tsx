'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { auth } from '@/lib/auth/auth';
import { authClient } from '@/lib/auth/client';
import { createColumnHelper } from '@tanstack/react-table';
import { BadgePlus, Ban, Check, ShieldCheck, User2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ComponentType, KeyboardEvent, MouseEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  issuer: BadgePlus,
  user: User2,
  banned: Ban,
  active: Check,
};

type User = (typeof auth.$Infer.Session)['user'];

const columnHelper = createColumnHelper<User>();

function BanUserAction({ user, onComplete }: { user: User; onComplete?: () => void }) {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<string>('forever');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getBanExpiresIn = () => {
    switch (banDuration) {
      case '1hour':
        return 1000 * 60 * 60;
      case '1day':
        return 1000 * 60 * 60 * 24;
      case '1week':
        return 1000 * 60 * 60 * 24 * 7;
      case '1month':
        return 1000 * 60 * 60 * 24 * 30;
      default:
        return undefined;
    }
  };

  const handleBanUser = async (e?: MouseEvent | KeyboardEvent) => {
    e?.preventDefault();
    if (!banReason.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      await authClient.admin.banUser({
        userId: user.id,
        banReason: banReason.trim(),
        banExpiresIn: getBanExpiresIn(),
      });
      toast.success('User banned successfully');
      setShowBanDialog(false);
      setBanReason('');
      router.refresh();
      onComplete?.();
    } catch (error) {
      toast.error(`Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanUser = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await authClient.admin.unbanUser({
        userId: user.id,
      });
      toast.success('User unbanned successfully');
      router.refresh();
      onComplete?.();
    } catch (error) {
      toast.error(`Failed to unban user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanClick = (e: MouseEvent) => {
    e.preventDefault();
    if (user.banned) {
      handleUnbanUser(e);
    } else {
      setShowBanDialog(true);
    }
  };

  return (
    <>
      <DropdownMenuItem onClick={handleBanClick} disabled={isLoading}>
        {user.banned ? (isLoading ? 'Unbanning...' : 'Unban') : 'Ban'}
      </DropdownMenuItem>

      <Dialog open={showBanDialog} onOpenChange={(open) => !isLoading && setShowBanDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Enter a reason for banning {user.name}. This will be recorded and visible to administrators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Enter ban reason..."
              required
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && banReason.trim()) {
                  handleBanUser(e);
                }
              }}
            />

            <Select value={banDuration} onValueChange={setBanDuration} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select ban duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forever">Forever</SelectItem>
                <SelectItem value="1hour">1 Hour</SelectItem>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setShowBanDialog(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={(e) => handleBanUser(e)} disabled={!banReason.trim() || isLoading}>
              {isLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] border-muted"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] border-muted"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ renderValue, row }) => (
      <DataTableColumnCell>
        <AddressAvatar
          email={row.original.email}
          address={row.original.wallet}
          imageUrl={row.original.image}
          variant="small"
        />
        <span>{renderValue()}</span>
        {row.original.banned && <Badge variant="destructive">Banned for "{row.original.banReason}"</Badge>}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('email', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Email</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('role', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Role</DataTableColumnHeader>,
    cell: ({ renderValue }) => {
      const role = renderValue();
      const Icon = role ? icons[role] : null;
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{role}</span>
        </DataTableColumnCell>
      );
    },
  }),
  columnHelper.accessor('wallet', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>{getValue() && <EvmAddress address={getValue()} />}</DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableRowActions detailUrl={`/admin/users/${row.original.id}`}>
        <BanUserAction user={row.original} />
      </DataTableRowActions>
    ),
  }),
];
