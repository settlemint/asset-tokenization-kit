import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Route configuration for the addons list page
 *
 * This route displays a list of all available system addons.
 * The route is authenticated and requires the user to be onboarded.
 *
 * Route path: `/addon`
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({ to: '/addon' });
 * ```
 */
export const Route = createFileRoute("/_private/_onboarded/_sidebar/addon/")({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Addons list page component
 *
 * Displays a list of all system addons with their details.
 * Currently a stub implementation.
 */
function RouteComponent() {
  const { t } = useTranslation("navigation");

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <h1 className="text-3xl font-bold tracking-tight">{t("addons")}</h1>
        <p className="text-muted-foreground">
          Manage system addons for airdrops, yield, and XvP
        </p>
      </div>

      <div className="text-muted-foreground">
        {/* TODO: Implement AddonsTable component */}
        <p>Addons list will be displayed here</p>
      </div>
    </div>
  );
}
