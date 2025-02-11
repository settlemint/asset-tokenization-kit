import type { ListUser } from '@/app/(private)/admin/users/(table)/_components/data';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useState } from 'react';
import { toast } from 'sonner';

export function ChangeRoleAction({ user, onComplete }: { user: ListUser; onComplete?: () => void }) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(user.role || 'user');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (e: MouseEvent) => {
    e.preventDefault();
    if (selectedRole === user.role) {
      return;
    }

    try {
      setIsLoading(true);
      await authClient.admin.setRole({
        userId: user.id,
        role: selectedRole as 'user' | 'issuer' | 'admin',
      });
      toast.success('User role updated successfully');
      setShowRoleDialog(false);
      router.refresh();
      onComplete?.();
    } catch (error) {
      toast.error(`Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setShowRoleDialog(true);
        }}
        disabled={isLoading}
      >
        Change Role
      </DropdownMenuItem>

      <Dialog open={showRoleDialog} onOpenChange={(open) => !isLoading && setShowRoleDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {user.name}. This will change their permissions in the system.
            </DialogDescription>
          </DialogHeader>

          <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="issuer">Issuer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setShowRoleDialog(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={(e) => {
                handleRoleChange(e).catch((error) => {
                  toast.error(`Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`);
                });
              }}
              disabled={selectedRole === user.role || isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
