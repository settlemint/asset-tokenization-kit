'use client';

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
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useState } from 'react';
import { toast } from 'sonner';

const UpdateKycStatusMutation = hasuraGraphql(`
  mutation UpdateKycStatus($userId: String!, $kycVerified: timestamp) {
    update_user_by_pk(pk_columns: {id: $userId}, _set: {kyc_verified: $kycVerified}) {
      id
      kyc_verified
    }
  }
`);

export function UpdateKycStatusAction({ user, onComplete }: { user: ListUser; onComplete?: () => void }) {
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: MouseEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await hasuraClient.request(UpdateKycStatusMutation, {
        userId: user.id,
        kycVerified: user.kyc_verified ? null : new Date().toJSON(),
      });

      toast.success('KYC status updated successfully');
      setShowDialog(false);
      router.refresh();
      onComplete?.();
    } catch (error) {
      toast.error(`Failed to update KYC status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setShowDialog(true);
        }}
        disabled={isLoading}
        className="dropdown-menu-item"
      >
        {user.kyc_verified ? 'Remove KYC Verification' : 'Verify KYC'}
      </DropdownMenuItem>

      <Dialog open={showDialog} onOpenChange={(open) => !isLoading && setShowDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user.kyc_verified ? 'Remove KYC Verification' : 'Verify KYC'}</DialogTitle>
            <DialogDescription>
              {user.kyc_verified
                ? `Are you sure you want to remove KYC verification for ${user.name}?`
                : `Are you sure you want to verify KYC for ${user.name}?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setShowDialog(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={user.kyc_verified ? 'destructive' : 'default'}
              onClick={(e) => {
                handleStatusChange(e).catch((error) => {
                  toast.error(
                    `Failed to update KYC status: ${error instanceof Error ? error.message : 'Unknown error'}`
                  );
                });
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : user.kyc_verified ? 'Remove Verification' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
