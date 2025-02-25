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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, type MouseEvent, useState } from 'react';
import { toast } from 'sonner';
import type { ListUser } from '../data';

export function BanUserAction({
  user,
  onComplete,
}: {
  user: ListUser;
  onComplete?: () => void;
}) {
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
      toast.error(
        `Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
      toast.error(
        `Failed to unban user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanClick = (e: MouseEvent) => {
    e.preventDefault();
    if (user.banned) {
      handleUnbanUser(e).catch((error) => {
        toast.error(
          `Failed to unban user: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      });
    } else {
      setShowBanDialog(true);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onClick={handleBanClick}
        disabled={isLoading}
        className="dropdown-menu-item"
      >
        {user.banned ? (isLoading ? 'Unbanning...' : 'Unban') : 'Ban'}
      </DropdownMenuItem>

      <Dialog
        open={showBanDialog}
        onOpenChange={(open) => !isLoading && setShowBanDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Enter a reason for banning {user.name}. This will be recorded and
              visible to administrators.
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
                  handleBanUser(e).catch((error) => {
                    toast.error(
                      `Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}`
                    );
                  });
                }
              }}
            />

            <Select
              value={banDuration}
              onValueChange={setBanDuration}
              disabled={isLoading}
            >
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
            <Button
              variant="destructive"
              onClick={(e) => {
                handleBanUser(e).catch((error) => {
                  toast.error(
                    `Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}`
                  );
                });
              }}
              disabled={!banReason.trim() || isLoading}
            >
              {isLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
