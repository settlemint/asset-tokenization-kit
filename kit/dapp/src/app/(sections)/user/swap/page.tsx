import { auth } from "@/lib/auth/auth";
import type { Address } from "viem";
import { Swap } from "./_components/swap";

export default async function UserSwap() {
  const session = await auth();
  const address = session?.user.wallet;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Swap tokens</h2>
      </div>
      <Swap address={address as Address} />
    </>
  );
}
