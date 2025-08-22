import {
  AlertDialog,
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
import { VerificationButton } from "@/components/verification-dialog/verification-button";
import { client, orpc } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface TopicActionsMenuProps {
  topic: TopicScheme;
  onEdit: () => void;
}

/**
 * Actions menu component for topic table rows
 * Provides edit and delete functionality for custom topics
 */
export function TopicActionsMenu({ topic, onEdit }: TopicActionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation("claim-topics-issuers");

  // Delete topic mutation
  const deleteMutation = useMutation({
    mutationFn: (walletVerification: UserVerification) =>
      client.system.claimTopics.topicDelete({
        name: topic.name,
        walletVerification,
      }),
    onSuccess: () => {
      toast.success(t("claimTopics.toast.deleted"));
      setShowDeleteDialog(false);
      // Invalidate and refetch topics data
      void queryClient.invalidateQueries({
        queryKey: orpc.system.claimTopics.topicList.queryKey(),
      });
    },
    onError: (error) => {
      toast.error(t("claimTopics.toast.deleteError", { error: error.message }));
    },
  });

  const handleDelete = (walletVerification: UserVerification) => {
    deleteMutation.mutate(walletVerification);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">
              {t("claimTopics.actions.menu.openMenu")}
            </span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t("claimTopics.actions.menu.editSignature")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setShowDeleteDialog(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("claimTopics.actions.menu.deleteTopic")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("claimTopics.actions.delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {t("claimTopics.actions.delete.description", {
                  topicName: topic.name,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("claimTopics.actions.delete.warning")}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("claimTopics.actions.delete.cancel")}
            </AlertDialogCancel>
            <VerificationButton
              disabled={deleteMutation.isPending}
              walletVerification={{
                title: t("claimTopics.actions.delete.title"),
                description: t("claimTopics.actions.delete.description"),
              }}
              onSubmit={handleDelete}
            >
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteMutation.isPending
                  ? t("claimTopics.actions.delete.deleting")
                  : t("claimTopics.actions.delete.confirm")}
              </Button>
            </VerificationButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
