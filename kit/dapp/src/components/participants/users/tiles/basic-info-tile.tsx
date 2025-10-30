import {
  Tile,
  TileContent,
  TileFooter,
  TileFooterAction,
  TileHeader,
  TileTitle,
} from "@/components/tile/tile";
import { formatDate } from "@/lib/utils/date";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import { orpc } from "@/orpc/orpc-client";
import type { UserReadOutput } from "@/orpc/routes/user/routes/user.read.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditBasicInfoSheet } from "../actions/edit-basic-info-sheet";

export interface BasicInfoTileProps {
  user: UserReadOutput;
}

/**
 * Overview tile summarizing core user details with inline edit entry point.
 * Automatically restricts editing controls to identity managers using live system permissions.
 */
export function BasicInfoTile({ user }: BasicInfoTileProps) {
  const { t, i18n } = useTranslation(["user", "common"]);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const { data: system } = useSuspenseQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const canEdit = Boolean(system.userPermissions?.roles.identityManager);

  const editLabel = t("common:actions.edit");
  const detailLabel = canEdit ? editLabel : undefined;

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
        detailLabel={detailLabel}
        onOpenDetail={
          canEdit
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
        {canEdit ? (
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
      {canEdit ? (
        <EditBasicInfoSheet
          user={user}
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          canEdit
        />
      ) : null}
    </>
  );
}
