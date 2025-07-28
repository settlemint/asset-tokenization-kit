import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PauseUnpauseConfirmationSheet } from "@/components/manage-dropdown/pause-unpause-confirmation-sheet";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Pause, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ManageAssetDropdownProps {
  asset: Token; // Keep Token type to maintain API compatibility
}

export function ManageAssetDropdown({ asset }: ManageAssetDropdownProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();
  const [openAction, setOpenAction] = useState<"pause" | "unpause" | null>(
    null
  );
  const [showConfirmationSheet, setShowConfirmationSheet] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const isPaused = asset.pausable.paused;

  // Pause mutation
  const { mutate: pauseAsset } = useMutation(
    orpc.token.pause.mutationOptions({
      onSuccess: async () => {
        // Invalidate both single asset and list queries
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.token.read.key({
              input: { tokenAddress: asset.id },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.list.key(),
          }),
        ]);
        setShowVerificationDialog(false);
        setOpenAction(null);
        toast.success(t("actions.pause.messages.success"));
      },
      onError: (error) => {
        toast.error(t("actions.pause.messages.error"), {
          description: error.message,
        });
      },
    })
  );

  // Unpause mutation
  const { mutate: unpauseAsset } = useMutation(
    orpc.token.unpause.mutationOptions({
      onSuccess: async () => {
        // Invalidate both single asset and list queries
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.token.read.key({
              input: { tokenAddress: asset.id },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.list.key(),
          }),
        ]);
        setShowVerificationDialog(false);
        setOpenAction(null);
        toast.success(t("actions.unpause.messages.success"));
      },
      onError: (error) => {
        toast.error(t("actions.unpause.messages.error"), {
          description: error.message,
        });
      },
    })
  );

  const handleVerificationSubmit = (verification: UserVerification) => {
    if (openAction === "pause") {
      pauseAsset({
        contract: asset.id,
        verification,
      });
    } else if (openAction === "unpause") {
      unpauseAsset({
        contract: asset.id,
        verification,
      });
    }
  };

  const actions = useMemo(
    () => [
      {
        id: isPaused ? "unpause" : "pause",
        label: isPaused
          ? t("tokens:actions.unpause.label")
          : t("tokens:actions.pause.label"),
        icon: isPaused ? Play : Pause,
        onClick: () => {
          setOpenAction(isPaused ? "unpause" : "pause");
          setShowConfirmationSheet(true);
        },
        disabled: false,
      },
    ],
    [isPaused, t]
  );

  const handleCancel = () => {
    setShowVerificationDialog(false);
    setShowConfirmationSheet(false);
    setOpenAction(null);
  };

  const handleConfirmationProceed = () => {
    setShowConfirmationSheet(false);
    setShowVerificationDialog(true);
  };

  const handleConfirmationCancel = () => {
    setShowConfirmationSheet(false);
    setOpenAction(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2">
            {t("tokens:manage")}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onSelect={action.onClick}
              disabled={action.disabled}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            {t("tokens:actions.viewEvents")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PauseUnpauseConfirmationSheet
        open={showConfirmationSheet}
        onOpenChange={setShowConfirmationSheet}
        asset={asset}
        action={openAction || "pause"}
        onProceed={handleConfirmationProceed}
        onCancel={handleConfirmationCancel}
      />

      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowVerificationDialog(false);
            setOpenAction(null);
          }
        }}
        title={
          openAction === "pause"
            ? t("tokens:actions.pause.title")
            : t("tokens:actions.unpause.title")
        }
        description={
          openAction === "pause"
            ? t("tokens:actions.pause.description")
            : t("tokens:actions.unpause.description")
        }
        onSubmit={handleVerificationSubmit}
        onCancel={handleCancel}
      />
    </>
  );
}
