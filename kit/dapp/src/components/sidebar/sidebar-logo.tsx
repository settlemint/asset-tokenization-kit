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

  // Get size multipliers
  const logoSize = branding.logoSize ? parseFloat(branding.logoSize) : 1.0;
  const titleSize = branding.titleSize ? parseFloat(branding.titleSize) : 1.0;

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
                  className="object-contain"
                  style={{
                    width: `${logoSize * 1.25}rem`,
                    height: `${logoSize * 1.25}rem`,
                  }}
                />
                <span
                  className="font-semibold"
                  style={{ fontSize: `${titleSize}rem` }}
                >
                  {branding.applicationTitle || "Asset Tokenization Kit"}
                </span>
              </div>
            ) : branding.logoMain ? (
              <div className="flex items-center gap-2">
                <img
                  src={branding.logoMain}
                  alt={branding.applicationTitle || "Logo"}
                  className="object-contain"
                  style={{ height: `${logoSize * 1.25}rem` }}
                />
                {!branding.logoSidebar && (
                  <span
                    className="font-semibold"
                    style={{ fontSize: `${titleSize}rem` }}
                  >
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
