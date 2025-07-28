import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Wand2 } from "lucide-react";

/**
 * Route configuration for the addon designer page
 *
 * This route provides an interface for creating and configuring new system addons.
 * The route is authenticated and requires the user to be onboarded.
 *
 * Route path: `/addon-designer`
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({ to: '/addon-designer' });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/addon-designer"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Addon designer page component
 *
 * Provides an interface for creating new system addons.
 * Currently a stub implementation.
 */
function RouteComponent() {
  const { t } = useTranslation("navigation");

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center gap-3">
          <Wand2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">
            {t("addonDesigner")}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Create and configure system addons for airdrops, yield distribution,
          and XvP settlements
        </p>
      </div>

      <div className="text-muted-foreground">
        {/* TODO: Implement addon designer form */}
        <p>Addon designer interface will be implemented here</p>
        <p className="mt-2">This will allow creating:</p>
        <ul className="mt-2 ml-6 list-disc">
          <li>Airdrop addons (Push, Vesting, Time-bound)</li>
          <li>Yield distribution addons</li>
          <li>XvP settlement addons</li>
        </ul>
      </div>
    </div>
  );
}
