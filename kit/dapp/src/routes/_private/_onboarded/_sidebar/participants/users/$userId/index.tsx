import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tile,
  TileContent,
  TileFooter,
  TileHeader,
  TileSubtitle,
  TileTitle,
  TileFooterAction,
} from "@/components/tile/tile";
import { formatDate } from "@/lib/utils/date";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { UserRound } from "lucide-react";
import type { UserReadOutput } from "@/orpc/routes/user/routes/user.read.schema";
import { useTranslation } from "react-i18next";

/**
 * Route configuration for the user details index page
 *
 * This route displays the default view for a specific user's details page.
 * It inherits the user data from its parent route and displays the main
 * user information in detail grids.
 *
 * Route path: `/participants/users/{userId}/`
 *
 * @remarks
 * - This is a child route that inherits data from the parent $userId route
 * - User data is already loaded by the parent route loader
 * - Shows the Details tab content with basic and identity information
 * - Parent route handles layout, breadcrumbs, and tab navigation
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/users/$userId/"
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
    from: "/_private/_onboarded/_sidebar/participants/users/$userId",
  });
  const { t } = useTranslation(["user", "common"]);

  const displayName = getUserDisplayName(user);

  return (
    <>
      <BasicInfoTile user={user} displayName={displayName} />
      {/* Basic Information */}
      <DetailGrid>
        <DetailGridItem
          label={t("user:fields.fullName")}
          info={t("user:fields.fullNameInfo")}
          value={displayName || "-"}
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
          emptyValue={t("user:fields.noWalletConnected")}
          addressOptions={{
            showPrettyName: false,
          }}
        />

        <DetailGridItem
          label={t("user:fields.onChainIdentity")}
          info={t("user:fields.onChainIdentityInfo")}
          emptyValue={t("user:fields.noIdentityRegistered")}
          type={identity ? "address" : "text"}
          value={identity ? identity.id : t("user:fields.noIdentityRegistered")}
          addressOptions={{
            showPrettyName: false,
            linkOptions: identity
              ? {
                  to: "/participants/entities/$address",
                  params: { address: identity.id },
                }
              : undefined,
          }}
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

interface BasicInfoTileProps {
  user: UserReadOutput;
  displayName: string | null;
}

interface BasicInfoFormState {
  firstName: string;
  lastName: string;
  email: string;
}

function BasicInfoTile({ user, displayName }: BasicInfoTileProps) {
  const { t, i18n } = useTranslation(["user", "common"]);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const infoItems = useMemo(
    () => [
      {
        label: t("user:fields.fullName", { defaultValue: "Name" }),
        value: displayName || "-",
      },
      {
        label: t("user:fields.email", { defaultValue: "Email" }),
        value: user.email ?? "-",
      },
      {
        label: t("user:fields.accountCreated", { defaultValue: "Created" }),
        value: user.createdAt
          ? formatDate(user.createdAt, "yyyy-MM-dd", i18n.language)
          : "-",
      },
      {
        label: t("user:fields.lastLogin", { defaultValue: "Last Login" }),
        value: user.lastLoginAt
          ? formatDate(
              user.lastLoginAt,
              {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZoneName: "short",
              },
              i18n.language
            )
          : "-",
      },
    ],
    [
      displayName,
      i18n.language,
      t,
      user.createdAt,
      user.email,
      user.lastLoginAt,
    ]
  );

  const initialFormState = useMemo<BasicInfoFormState>(
    () => ({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
    }),
    [user.email, user.firstName, user.lastName]
  );

  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    setFormState(initialFormState);
  }, [initialFormState]);

  const handleFieldChange = useCallback(
    (field: keyof BasicInfoFormState) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [field]: event.target.value }));
      },
    []
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsEditSheetOpen(false);
    },
    [setIsEditSheetOpen]
  );

  return (
    <>
      <Tile
        className="mb-6"
        detailLabel={t("common:actions.edit", { defaultValue: "Edit" })}
        onOpenDetail={() => setIsEditSheetOpen(true)}
      >
        <TileHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <TileTitle>
                {t("user:details.basicInfo.title", {
                  defaultValue: "Basic Info",
                })}
              </TileTitle>
              <TileSubtitle>
                {t("user:details.basicInfo.subtitle", {
                  defaultValue: "Snapshot of the user's profile details.",
                })}
              </TileSubtitle>
            </div>
          </div>
        </TileHeader>
        <TileContent className="gap-4">
          <dl className="space-y-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </TileContent>
        <TileFooter className="justify-center">
          <TileFooterAction variant="outline" className="w-full justify-center">
            {t("common:actions.edit", { defaultValue: "Edit" })}
          </TileFooterAction>
        </TileFooter>
      </Tile>
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>
              {t("user:details.basicInfo.editTitle", {
                defaultValue: "Edit basic info",
              })}
            </SheetTitle>
            <SheetDescription>
              {t("user:details.basicInfo.editDescription", {
                defaultValue: "Update the user's name and email address.",
              })}
            </SheetDescription>
          </SheetHeader>
          <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="space-y-4 px-6">
              <div className="space-y-2">
                <Label htmlFor="basic-info-first-name">
                  {t("user:fields.firstName", { defaultValue: "First name" })}
                </Label>
                <Input
                  id="basic-info-first-name"
                  value={formState.firstName}
                  onChange={handleFieldChange("firstName")}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basic-info-last-name">
                  {t("user:fields.lastName", { defaultValue: "Last name" })}
                </Label>
                <Input
                  id="basic-info-last-name"
                  value={formState.lastName}
                  onChange={handleFieldChange("lastName")}
                  autoComplete="family-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basic-info-email">
                  {t("user:fields.email", { defaultValue: "Email" })}
                </Label>
                <Input
                  id="basic-info-email"
                  type="email"
                  value={formState.email}
                  onChange={handleFieldChange("email")}
                  autoComplete="email"
                />
              </div>
            </div>
            <SheetFooter className="gap-2 px-6 pb-6 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSheetOpen(false)}
              >
                {t("common:actions.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button type="submit">
                {t("common:actions.save", { defaultValue: "Save changes" })}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
