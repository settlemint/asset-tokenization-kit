import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import { type TopicCreateInput } from "@/orpc/routes/system/claim-topics/routes/topic.create.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Dialog component for adding new claim topics
 * Allows administrators to create custom topics for identity verification
 */
export function AddTopicDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("claim-topics-issuers");

  const createMutation = useMutation({
    mutationFn: (data: TopicCreateInput) =>
      client.system.claimTopics.topicCreate(data),
    onSuccess: (result) => {
      toast.success(t("claimTopics.toast.created", { name: result.name }));
      void queryClient.invalidateQueries({
        queryKey: orpc.system.claimTopics.topicList.queryKey(),
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(
        t("claimTopics.toast.createError", {
          error: error.message || error.toString() || "Unknown error",
        })
      );
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      signature: "",
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE",
      },
    },
    onSubmit: ({ value }) => {
      createMutation.mutate(value as TopicCreateInput);
    },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  // Avoids reference to an unbound method which may cause unintentional scoping of `this`
  const handleSubmit = () => {
    void form.handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("claimTopics.add.title")}</DialogTitle>
          <DialogDescription>
            {t("claimTopics.add.description")}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <div className="space-y-4">
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  label={t("claimTopics.add.fields.name.label")}
                  required={true}
                  description={t("claimTopics.add.fields.name.description")}
                />
              )}
            />

            <form.AppField
              name="signature"
              children={(field) => (
                <field.TextField
                  label={t("claimTopics.add.fields.signature.label")}
                  required={true}
                  description={t(
                    "claimTopics.add.fields.signature.description"
                  )}
                />
              )}
            />
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              {t("claimTopics.add.actions.cancel")}
            </Button>
            <form.VerificationButton
              onSubmit={handleSubmit}
              walletVerification={{
                title: t("claimTopics.add.verification.title"),
                description: t("claimTopics.add.verification.description"),
                setField: (verification) => {
                  form.setFieldValue("walletVerification", verification);
                },
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? t("claimTopics.add.actions.creating")
                : t("claimTopics.add.actions.create")}
            </form.VerificationButton>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
