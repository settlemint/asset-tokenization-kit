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
import { TopicCreateInputSchema } from "@/orpc/routes/system/claim-topics/routes/topic.create.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

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
  const { t } = useTranslation("claim-topics");


  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof TopicCreateInputSchema>) =>
      client.system.topicCreate(data),
    onSuccess: (result) => {
      toast.success(t("toast.created", { name: result.name }));
      void queryClient.invalidateQueries({
        queryKey: orpc.system.topicList.queryKey(),
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(t("toast.createError", { error: error.message }));
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      signature: "",
    },
    validators: {
      onChange: TopicCreateInputSchema,
    },
    onSubmit: ({ value }) => {
      createMutation.mutate(value);
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
          <DialogTitle>{t("add.title")}</DialogTitle>
          <DialogDescription>{t("add.description")}</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <div className="space-y-4">
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  label={t("add.fields.name.label")}
                  required={true}
                  description={t("add.fields.name.description")}
                />
              )}
            />

            <form.AppField
              name="signature"
              children={(field) => (
                <field.TextField
                  label={t("add.fields.signature.label")}
                  required={true}
                  description={t("add.fields.signature.description")}
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
              {t("add.actions.cancel")}
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending ||
                    !state.canSubmit ||
                    Object.keys(state.errors).length > 0
                  }
                >
                  {createMutation.isPending
                    ? t("add.actions.creating")
                    : t("add.actions.create")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
