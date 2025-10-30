import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { Button } from "@/components/ui/button";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const routeParamsSchema = z.object({
  addonAddress: ethereumAddress,
});

/**
 * Route configuration for the addon details page
 *
 * This route displays detailed information about a specific system addon.
 * The route is authenticated and requires the user to be onboarded.
 *
 * Route path: `/addon/{addonAddress}`
 *
 * @remarks
 * - The addonAddress parameter must be a valid Ethereum address
 * - Search parameters are validated to support data table state persistence
 * - Addon data will be cached using TanStack Query for optimal performance
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/addon/$addonAddress',
 *   params: { addonAddress: '0x1234...' }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/addon/$addonAddress"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  /**
   * Loader function to prepare page data
   * Currently returns mock data - will be replaced with actual addon query
   */
  loader: ({ params: { addonAddress } }) => {
    // TODO: Replace with actual addon query
    const mockAddon = {
      id: addonAddress,
      name: "Example Addon",
      typeId: "ATKPushAirdropFactory",
    };

    return {
      addon: mockAddon,
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Addon details page component
 *
 * Displays detailed information about a specific system addon.
 * Currently a stub implementation.
 */
function RouteComponent() {
  const { addon } = Route.useLoaderData();

  const handleCopyAddress = () => {
    void navigator.clipboard.writeText(addon.id);
    toast.success("Address copied to clipboard");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{addon.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyAddress}
            title="Copy address"
            className="press-effect"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">Type: {addon.typeId}</p>
      </div>

      <div className="text-muted-foreground">
        {/* TODO: Implement addon details content */}
        <p>Addon details will be displayed here</p>
        <p className="mt-2">Address: {addon.id}</p>
        <p>Type: {addon.typeId}</p>
      </div>
    </div>
  );
}
