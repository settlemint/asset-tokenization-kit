import { authClient } from "@/lib/auth/auth.client";
import {
  isPlatformOnboardingComplete,
  type PlatformOnboardingRequirements,
} from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Designer</h1>
      <OnboardingDebugInfo />
      <div className="mt-4">
        <p>Hello "/_private/_onboarded/_asset-designer/"!</p>
      </div>
    </div>
  );
}

function OnboardingDebugInfo() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Fetch system address from settings
  const { data: systemAddress } = useQuery({
    ...orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } }),
    enabled: !!user,
  });

  // Fetch system details including token factories
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
  });

  // Determine platform onboarding requirements
  const platformRequirements: PlatformOnboardingRequirements = {
    hasWallet: !!user?.initialOnboardingFinished,
    hasSystem: !!systemAddress,
    hasTokenFactories: (systemDetails?.tokenFactories.length ?? 0) > 0,
  };

  const isComplete = isPlatformOnboardingComplete(platformRequirements);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Onboarding Debug Info</h3>
      <div className="space-y-1 text-sm">
        <p>
          <strong>User Role:</strong> {user?.role || "Unknown"}
        </p>
        <p>
          <strong>Has Wallet:</strong>{" "}
          {platformRequirements.hasWallet ? "✅" : "❌"}
        </p>
        <p>
          <strong>Has System:</strong>{" "}
          {platformRequirements.hasSystem ? "✅" : "❌"}
        </p>
        <p>
          <strong>System Address:</strong> {systemAddress || "None"}
        </p>
        <p>
          <strong>Has Token Factories:</strong>{" "}
          {platformRequirements.hasTokenFactories ? "✅" : "❌"}
        </p>
        <p>
          <strong>Token Factories Count:</strong>{" "}
          {systemDetails?.tokenFactories.length ?? 0}
        </p>
        <p>
          <strong>Platform Onboarding Complete:</strong>{" "}
          {isComplete ? "✅" : "❌"}
        </p>
      </div>
      {!isComplete && (
        <p className="mt-2 text-yellow-600 dark:text-yellow-400">
          <strong>Action needed:</strong> Complete platform onboarding at{" "}
          <code>/onboarding/platform</code>
        </p>
      )}
    </div>
  );
}
