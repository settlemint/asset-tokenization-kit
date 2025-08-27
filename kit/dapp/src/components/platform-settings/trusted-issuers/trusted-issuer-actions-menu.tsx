import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { TrustedIssuer } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface TrustedIssuerActionsMenuProps {
  issuer: TrustedIssuer;
  onEditTopics: () => void;
}

/**
 * Actions menu component for trusted issuer table rows
 * Provides edit topics and remove issuer functionality
 */
export function TrustedIssuerActionsMenu({
  issuer,
  onEditTopics,
}: TrustedIssuerActionsMenuProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation("claim-topics-issuers");

  // Remove issuer mutation
  const removeMutation = useMutation({
    mutationFn: (verification: UserVerification) =>
      client.system.trustedIssuers.delete({
        issuerAddress: issuer.id,
        walletVerification: verification,
      }),
    onSuccess: () => {
      toast.success(t("trustedIssuers.toast.removed"));
      void queryClient.invalidateQueries({
        queryKey: orpc.system.trustedIssuers.list.queryKey(),
      });
      setShowRemoveDialog(false);
      setShowVerificationDialog(false);
    },
    onError: (error) => {
      toast.error(
        t("trustedIssuers.toast.removeError", {
          error: error.message || error.toString() || "Unknown error",
        })
      );
      setShowVerificationDialog(false);
    },
  });

  const handleRemove = () => {
    // Show verification dialog after user confirms removal
    setShowRemoveDialog(false);
    setShowVerificationDialog(true);
  };

  const handleVerificationSubmit = (verification: UserVerification) => {
    removeMutation.mutate(verification);
  };

  const handleVerificationCancel = () => {
    setShowVerificationDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">
              {t("trustedIssuers.actions.menu.openMenu")}
            </span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEditTopics}>
            <Edit className="mr-2 h-4 w-4" />
            {t("trustedIssuers.actions.menu.editTopics")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setShowRemoveDialog(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("trustedIssuers.actions.menu.removeIssuer")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("trustedIssuers.actions.remove.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {t("trustedIssuers.actions.remove.description", {
                  issuerAddress: issuer.id,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("trustedIssuers.actions.remove.warning")}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("trustedIssuers.actions.remove.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {removeMutation.isPending
                ? t("trustedIssuers.actions.remove.removing")
                : t("trustedIssuers.actions.remove.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        title={t("trustedIssuers.actions.remove.verification.title")}
        description={t(
          "trustedIssuers.actions.remove.verification.description"
        )}
        onSubmit={handleVerificationSubmit}
        onCancel={handleVerificationCancel}
      />
    </>
  );
}
