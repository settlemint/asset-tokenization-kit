import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Route configuration for the user details index page
 *
 * This route displays the default view for a specific user's details page.
 * It inherits the user data from its parent route and displays the main
 * user information in detail grids.
 *
 * Route path: `/admin/user-management/{userId}/`
 *
 * @remarks
 * - This is a child route that inherits data from the parent $userId route
 * - User data is already loaded by the parent route loader
 * - Shows the Details tab content with basic and identity information
 * - Parent route handles layout, breadcrumbs, and tab navigation
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/user-management/$userId/"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * User details index page component
 *
 * Displays detailed user information in structured grids.
 * Gets user data from the parent route's loader data.
 * Layout and navigation are handled by parent route.
 */
function RouteComponent() {
  // Get data from parent route loader
  const { user, identity } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/admin/user-management/$userId",
  });
  const { t } = useTranslation(["user", "common"]);

  const displayName = getUserDisplayName(user);

  return (
    <>
      {/* Basic Information */}
      <DetailGrid>
        <DetailGridItem
          label={t("user:fields.fullName")}
          info={t("user:fields.fullNameInfo")}
          value={displayName}
          type="text"
        />

        <DetailGridItem
          label={t("user:fields.email")}
          info={t("user:fields.emailInfo")}
        >
          <CopyToClipboard value={user.email ?? "-"} className="w-full">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-default truncate">
                  {user.email ?? "-"}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto max-w-[24rem]">
                <div className="break-all font-mono text-sm">
                  {user.email ?? "-"}
                </div>
              </HoverCardContent>
            </HoverCard>
          </CopyToClipboard>
        </DetailGridItem>

        <DetailGridItem
          label={t("user:fields.role")}
          info={t("user:fields.roleInfo")}
          value={user.role}
          type="text"
        />

        <DetailGridItem
          label={t("user:fields.accountCreated")}
          info={t("user:fields.accountCreatedInfo")}
          value={user.createdAt}
          type="date"
        />

        <DetailGridItem
          label={t("user:fields.lastLogin")}
          info={t("user:fields.lastLoginInfo")}
          value={user.lastLoginAt}
          type="date"
          dateOptions={{ relative: true }}
        />

        <DetailGridItem
          label={t("user:fields.walletAddress")}
          info={t("user:fields.walletAddressInfo")}
          value={user.wallet}
          type="address"
          showPrettyName={false}
          emptyValue={t("user:fields.noWalletConnected")}
        />

        <DetailGridItem
          label={t("user:fields.onChainIdentity")}
          info={t("user:fields.onChainIdentityInfo")}
          value={identity?.id}
          type="address"
          showPrettyName={false}
          emptyValue={t("user:fields.noIdentityRegistered")}
        />
      </DetailGrid>

      {/* KYC Information - Separate grid if available */}
      {user.firstName && user.lastName && (
        <DetailGrid title={t("user:details.kycInformation")}>
          <DetailGridItem
            label={t("user:fields.firstName")}
            info={t("user:fields.firstNameInfo")}
            value={user.firstName}
            type="text"
          />

          <DetailGridItem
            label={t("user:fields.lastName")}
            info={t("user:fields.lastNameInfo")}
            value={user.lastName}
            type="text"
          />
        </DetailGrid>
      )}
    </>
  );
}
