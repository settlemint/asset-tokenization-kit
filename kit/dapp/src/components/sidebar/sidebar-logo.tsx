import { AssetTokenizationKitLogo } from "@/components/asset-tokenization-kit-logo";
import { useBranding } from "@/components/branding/branding-context";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";

/**
 * Sidebar logo component that displays the branding logo or default SettleMint logo.
 */
export function SidebarLogo() {
  const branding = useBranding();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-4"
          asChild
        >
          <Link to="/">
            {branding.logoSidebar ? (
              <div className="flex items-center gap-2">
                <img
                  src={branding.logoSidebar}
                  alt={branding.applicationTitle || "Logo"}
                  className="size-5 object-contain"
                />
                <span className="text-md font-semibold">
                  {branding.applicationTitle || "Asset Tokenization Kit"}
                </span>
              </div>
            ) : branding.logoMain ? (
              <div className="flex items-center gap-2">
                <img
                  src={branding.logoMain}
                  alt={branding.applicationTitle || "Logo"}
                  className="h-5 object-contain"
                />
                {!branding.logoSidebar && (
                  <span className="text-md font-semibold">
                    {branding.applicationTitle || "Asset Tokenization Kit"}
                  </span>
                )}
              </div>
            ) : (
              <AssetTokenizationKitLogo />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
