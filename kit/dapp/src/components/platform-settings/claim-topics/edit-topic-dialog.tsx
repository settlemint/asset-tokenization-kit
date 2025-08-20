import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc, client } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { TopicUpdateInputSchema } from "@/orpc/routes/system/claim-topics/routes/topic.update.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { z } from "zod";

interface EditTopicDialogProps {
  topic: TopicScheme;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for editing claim topic signatures
 * Allows administrators to update the verification signature for custom topics
 */
export function EditTopicDialog({
  topic,
  open,
  onOpenChange,
}: EditTopicDialogProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("claim-topics");

  // Update topic mutation
  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof TopicUpdateInputSchema>) =>
      client.system.topicUpdate(data),
    onSuccess: (result) => {
      toast.success(t("toast.updated", { name: result.name }));
      // Invalidate and refetch topics data
      void queryClient.invalidateQueries({
        queryKey: orpc.system.topicList.queryKey(),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(t("toast.updateError", { error: error.message }));
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: topic.name,
      signature: topic.signature,
    } as z.infer<typeof TopicUpdateInputSchema>,
    validators: {
      onChange: TopicUpdateInputSchema,
      onSubmit: ({ value }) => {
        // Additional validation: signature must be different from current
        if (value.signature === topic.signature) {
          return { signature: t("edit.validation.signatureChanged") };
        }
      },
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  // Reset form when topic changes
  useEffect(() => {
    if (open) {
      form.setFieldValue("name", topic.name);
      form.setFieldValue("signature", topic.signature);
    }
  }, [open, topic.name, topic.signature, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}</DialogTitle>
          <DialogDescription>{t("edit.description")}</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <div className="space-y-4">
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    {t("edit.fields.name.label")}
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("edit.fields.name.description", {
                      topicId: Number(topic.topicId),
                    })}
                  </p>
                </div>
              )}
            </form.Field>

            <form.AppField
              name="signature"
              children={(field) => (
                <field.TextField
                  label={t("edit.fields.signature.label")}
                  required={true}
                  description={t("edit.fields.signature.description")}
                />
              )}
            />
            <div className="text-xs text-muted-foreground">
              <p>
                {t("edit.fields.signature.current", {
                  signature: topic.signature,
                })}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              {t("edit.actions.cancel")}
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="button"
                  onClick={() => void form.handleSubmit()}
                  disabled={
                    updateMutation.isPending ||
                    !state.canSubmit ||
                    Object.keys(state.errors).length > 0
                  }
                >
                  {updateMutation.isPending
                    ? t("edit.actions.updating")
                    : t("edit.actions.update")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
