"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/auth";
import { orpc } from "@/lib/orpc/orpc";
import type { EthereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function CreateAccount({
  userId,
  walletAddress,
}: {
  userId: string;
  walletAddress?: EthereumAddress;
}) {
  const { refetch: refetchSession } = useSession();

  const { mutate: createAccount, isPending: isCreatingAccount } = useMutation(
    orpc.account.create.mutationOptions({
      onSuccess: () => {
        refetchSession();
        toast.success("Account created");
      },
      onError: (error: Error) => {
        refetchSession();
        toast.error(error.message);
      },
    })
  );

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        <span>Account created</span>
      </div>
    );
  }

  return (
    <Button
      onClick={() => createAccount({ userId })}
      disabled={isCreatingAccount}
    >
      Create Account
    </Button>
  );
}
