"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/auth";
import { orpc } from "@/lib/orpc/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingView() {
  const { user, refetch: refetchSession } = useSession();

  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({
      input: {
        key: "SYSTEM_ADDRESS",
      },
    })
  );

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

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>OnboardingView</h1>
      <p>Hello {user?.name}</p>
      <li>Step 1: Create a wallet</li>
      {user.walletAddress ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Wallet created</span>
        </div>
      ) : (
        <Button
          onClick={() => createAccount({ userId: user.id })}
          disabled={isCreatingAccount}
        >
          Create Account
        </Button>
      )}
      <li>Step 2: Set pincode</li>
      ??
      <li>Step 3: Bootstrap system</li>
      {systemAddress ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>System bootstrapped</span>
        </div>
      ) : (
        <Button onClick={() => toast.error("Not implemented")}>
          Bootstrap system
        </Button>
      )}
    </div>
  );
}
