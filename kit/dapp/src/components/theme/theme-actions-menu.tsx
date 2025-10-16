import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, RotateCcw, Save } from "lucide-react";
import type { ThemeTranslateFn } from "./types";

export type ThemeActionsMenuProps = {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onResetDefaults: () => Promise<void> | void;
  onCloneTheme: () => Promise<void> | void;
  onSaveTheme: () => Promise<void> | void;
  t: ThemeTranslateFn;
};

export function ThemeActionsMenu({
  hasUnsavedChanges,
  isSaving,
  onResetDefaults,
  onCloneTheme,
  onSaveTheme,
  t,
}: ThemeActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          aria-label={t("settings.theme.actionsMenuLabel", "Theme actions")}
        >
          <span>{t("settings.theme.actionsMenuTrigger", "Actions")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          {t("settings.theme.actionsMenuTitle", "Theme actions")}
        </DropdownMenuLabel>
        <DropdownMenuItem
          disabled={isSaving || !hasUnsavedChanges}
          onSelect={() => {
            if (isSaving || !hasUnsavedChanges) {
              return;
            }
            void onSaveTheme();
          }}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving
            ? t("settings.theme.savingButton", "Saving…")
            : t("settings.theme.saveButton", "Save")}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isSaving}
          onSelect={() => {
            if (isSaving) {
              return;
            }
            void onResetDefaults();
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("settings.theme.resetDefaultsButton", "Reset defaults")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSaving || hasUnsavedChanges}
          onSelect={() => {
            if (isSaving || hasUnsavedChanges) {
              return;
            }
            void onCloneTheme();
          }}
          title={
            hasUnsavedChanges
              ? t(
                  "settings.theme.cloneDisabledTooltip",
                  "Save changes before cloning."
                )
              : undefined
          }
        >
          <Copy className="mr-2 h-4 w-4" />
          {t("settings.theme.cloneButton", "Clone theme")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
