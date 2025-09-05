import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { DateCell } from "@/components/data-table/cells/date-cell";
import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import type { TabItemProps } from "@/components/tab-navigation/tab-navigation";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";

interface UserDetailPageProps {
  user: User;
}

/**
 * Status badge component for user registration status
 */
function UserStatusBadge({ user }: { user: User }) {
  if (user.isRegistered) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Registered
      </Badge>
    );
  }

  if (user.wallet) {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        Pending Registration
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      Not Connected
    </Badge>
  );
}

/**
 * User detail page component with tabs interface
 *
 * Displays comprehensive user information in a tabbed interface.
 * Currently shows the Details tab with basic and identity information.
 * Can be extended with additional tabs for claims, activity, etc.
 */
export function UserDetailPage({ user }: UserDetailPageProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name;

  // Tab configuration - only Details tab for now, selected by default
  const tabs: TabItemProps[] = [
    {
      href: "#user-details",
      name: "User details",
    },
    // Future tabs can be added here
    // { href: "#claims", name: "Claims" },
    // { href: "#activity", name: "Activity" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section - Similar to token detail page */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
            <UserStatusBadge user={user} />
          </div>
        </div>
      </div>

      {/* Tab Navigation - Styled like token detail page */}
      <TabNavigation items={tabs} />

      {/* Details Content - Using DetailGrid like token detail page */}
      <DetailGrid>
        {/* Basic Information */}
        <DetailGridItem
          label="Full Name"
          info="User's display name"
          value={displayName}
          type="text"
        />

        <DetailGridItem label="Email" info="User's email address">
          <CopyToClipboard value={user.email} className="w-full">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-default truncate">{user.email}</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto max-w-[24rem]">
                <div className="break-all font-mono text-sm">{user.email}</div>
              </HoverCardContent>
            </HoverCard>
          </CopyToClipboard>
        </DetailGridItem>

        <DetailGridItem
          label="Role"
          info="User's system role"
          value={user.role}
          type="text"
        />

        <DetailGridItem
          label="Account Created"
          info="When the user account was created"
        >
          <DateCell value={user.createdAt} />
        </DetailGridItem>

        <DetailGridItem label="Last Login" info="Most recent login time">
          <DateCell
            value={user.lastLoginAt}
            fallback="Never logged in"
            relative
          />
        </DetailGridItem>

        {/* Identity Information */}
        <DetailGridItem
          label="Wallet Address"
          info="User's connected wallet address"
          value={user.wallet}
          type="address"
          showPrettyName={false}
          emptyValue="No wallet connected"
        />

        <DetailGridItem
          label="On-chain Identity"
          info="User's on-chain identity contract"
          value={user.identity}
          type="address"
          showPrettyName={false}
          emptyValue="No identity registered"
        />
      </DetailGrid>

      {/* KYC Information - Separate grid if available */}
      {user.firstName && user.lastName && (
        <DetailGrid title="KYC Information">
          <DetailGridItem
            label="First Name"
            info="Legal first name"
            value={user.firstName}
            type="text"
          />

          <DetailGridItem
            label="Last Name"
            info="Legal last name"
            value={user.lastName}
            type="text"
          />
        </DetailGrid>
      )}
    </div>
  );
}
