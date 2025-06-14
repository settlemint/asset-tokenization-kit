import { CreateAccount } from "@/app/[locale]/(private)/onboarding/_components/create-account";
import { getUser } from "@/lib/auth/utils";
import { HydrateClient } from "@/lib/query/hydrate-client";
import { getSetting } from "@/lib/utils/get-settings";

export default async function OnboardingPage() {
  const user = await getUser();
  const systemAddress = await getSetting("SYSTEM_ADDRESS", false);

  return (
    <HydrateClient>
      <div>
        <h1>OnboardingView</h1>
        <p>Hello {user?.name}</p>
        <li>Step 1: Create a wallet</li>
        <HydrateClient>
          <CreateAccount userId={user.id} walletAddress={user.walletAddress} />
        </HydrateClient>
        <li>Step 2: Set pincode</li>
        ??
        <li>Step 3: Bootstrap system</li>
        {/* {systemAddress ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>System bootstrapped</span>
        </div>
      ) : (
        <Button onClick={() => toast.error("Not implemented")}>
          Bootstrap system
        </Button>
      )} */}
      </div>
    </HydrateClient>
  );
}
