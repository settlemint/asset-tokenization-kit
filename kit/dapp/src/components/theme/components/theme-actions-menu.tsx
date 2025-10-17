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
import type { ThemeTranslateFn } from "../lib/types";

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
          aria-label={t("actionsMenuLabel")}
        >
          <span>{t("actionsMenuTrigger")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t("actionsMenuTitle")}</DropdownMenuLabel>
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
          {isSaving ? t("savingButton") : t("saveButton")}
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
          {t("resetDefaultsButton")}
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
          title={hasUnsavedChanges ? t("cloneDisabledTooltip") : undefined}
        >
          <Copy className="mr-2 h-4 w-4" />
          {t("cloneButton")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
