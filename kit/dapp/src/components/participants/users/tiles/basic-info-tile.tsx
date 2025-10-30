import {
  Tile,
  TileContent,
  TileFooter,
  TileFooterAction,
  TileHeader,
  TileTitle,
} from "@/components/tile/tile";
import { useSession } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils/date";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import type { UserReadOutput } from "@/orpc/routes/user/routes/user.read.schema";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import { UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditBasicInfoSheet } from "../actions/edit-basic-info-sheet";

export interface BasicInfoTileProps {
  user: UserReadOutput;
  canEdit?: boolean;
  systemRoles?: Partial<Record<AccessControlRoles, boolean>>;
}

/**
 * Overview tile summarizing core user details with inline edit entry point.
 */
export function BasicInfoTile({
  user,
  canEdit = false,
  systemRoles,
}: BasicInfoTileProps) {
  const { t, i18n } = useTranslation(["user", "common"]);
  const { data: session } = useSession();
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const editLabel = t("common:actions.edit");
  const sessionCanEdit =
    session?.user?.role === "admin" ||
    Boolean(session?.user?.isAdmin) ||
    Boolean(session?.user?.roles?.admin) ||
    Boolean(session?.user?.roles?.systemManager) ||
    Boolean(systemRoles?.admin) ||
    Boolean(systemRoles?.systemManager);
  const allowEdit = canEdit && sessionCanEdit;

  useEffect(() => {
    if (!allowEdit && isEditSheetOpen) {
      setIsEditSheetOpen(false);
    }
  }, [allowEdit, isEditSheetOpen]);

  const displayName = useMemo(() => getUserDisplayName(user), [user]);

  const infoItems = useMemo(
    () => [
      {
        label: t("user:fields.fullName"),
        value: displayName || "-",
      },
      {
        label: t("user:fields.email"),
        value: user.email ?? "-",
      },
      {
        label: t("user:fields.accountCreated"),
        value: user.createdAt
          ? formatDate(user.createdAt, "MMM d, yyyy HH:mm", i18n.language)
          : "-",
      },
      {
        label: t("user:fields.lastLogin"),
        value: user.lastLoginAt
          ? formatDate(user.lastLoginAt, "MMM d, yyyy HH:mm", i18n.language)
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

  return (
    <>
      <Tile
        detailLabel={allowEdit ? editLabel : undefined}
        onOpenDetail={
          allowEdit
            ? () => {
                setIsEditSheetOpen(true);
              }
            : undefined
        }
      >
        <TileHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <TileTitle>{t("user:details.basicInfo.title")}</TileTitle>
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
        {allowEdit ? (
          <TileFooter className="justify-center">
            <TileFooterAction
              variant="outline"
              className="w-full justify-center"
            >
              {editLabel}
            </TileFooterAction>
          </TileFooter>
        ) : null}
      </Tile>
      {allowEdit ? (
        <EditBasicInfoSheet
          user={user}
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          canEdit={allowEdit}
          systemRoles={systemRoles}
        />
      ) : null}
    </>
  );
}
