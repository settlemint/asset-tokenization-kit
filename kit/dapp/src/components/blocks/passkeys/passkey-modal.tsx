"use client";

import {
  FingerprintIcon,
  type FingerprintIconHandle,
} from "@/components/ui/animated-icons/fingerprint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";
import { formatDate } from "@/lib/utils/date";
import { TrashIcon } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

export function PasskeyModal() {
  const iconRef = useRef<FingerprintIconHandle>(null);

  const { data: passkeys, refetch } = authClient.useListPasskeys();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            // Prevent the dropdown from closing
            e.preventDefault();
          }}
          onMouseEnter={() => {
            iconRef.current?.startAnimation();
          }}
          onMouseLeave={() => {
            iconRef.current?.stopAnimation();
          }}
        >
          <FingerprintIcon ref={iconRef} className="mr-2 size-4" />
          Manage passkeys
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account security</DialogTitle>
          <DialogDescription>
            Secure your account with a passkey.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            {passkeys?.map((passkey, index) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between border p-2 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {passkey.name ?? `Passkey ${index + 1}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created at {formatDate(passkey.createdAt)}
                  </div>
                </div>
                <Button
                  size="icon"
                  onClick={() =>
                    authClient.passkey.deletePasskey({ id: passkey.id })
                  }
                  variant="destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {!passkeys?.length && (
              <div className="text-sm text-muted-foreground text-center py-2">
                No passkeys added yet.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              const result = await authClient.passkey.addPasskey();
              if (result?.error) {
                toast.error(result.error.message);
              } else {
                toast.success("Passkey added");
                refetch();
              }
            }}
          >
            Add passkey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
