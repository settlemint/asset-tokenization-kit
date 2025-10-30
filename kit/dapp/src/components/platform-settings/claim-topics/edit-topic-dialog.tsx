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
import { client, orpc } from "@/orpc/orpc-client";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

/**
 * Normalizes ABI type signature by trimming spaces around commas and collapsing multiple spaces
 */
function normalizeAbiSignature(value: string): string {
  return value
    .split(",")
    .map((part) => part.trim().replace(/\s+/g, " "))
    .join(", ");
}

// Form schema with only editable fields
const EditTopicFormSchema = z.object({
  signature: z
    .string()
    .min(1, "Signature is required")
    .describe("New claim data ABI types for claim verification")
    .refine((val) => !val.includes("(") && !val.includes(")"), {
      message: "Remove parentheses; use a comma-separated type list.",
    })
    .refine((val) => !/^\w+\(/.test(val), {
      message: "Remove function name; use type, type, ...",
    })
    .transform(normalizeAbiSignature),
  walletVerification: z.object({
    secretVerificationCode: z.string(),
    verificationType: z.enum(["PINCODE", "OTP", "SECRET_CODES"]),
  }),
});

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
  const { t } = useTranslation("claim-topics-issuers");

  // Update topic mutation
  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof EditTopicFormSchema>) =>
      client.system.claimTopics.topicUpdate({
        ...data,
        name: topic.name, // Pass name from topic prop, not form
      }),
    onSuccess: (result) => {
      toast.success(t("claimTopics.toast.updated", { name: result.name }));
      // Invalidate and refetch topics data
      void queryClient.invalidateQueries({
        queryKey: orpc.system.claimTopics.topicList.queryKey(),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(t("claimTopics.toast.updateError", { error: error.message }));
    },
  });

  const form = useAppForm({
    defaultValues: {
      signature: topic.signature,
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE",
      },
    } as z.infer<typeof EditTopicFormSchema>,
    validators: {
      onChange: EditTopicFormSchema,
      onSubmit: ({ value }) => {
        // Additional validation: signature must be different from current
        if (value.signature === topic.signature) {
          return {
            signature: t("claimTopics.edit.validation.signatureChanged"),
          };
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
      form.setFieldValue("signature", topic.signature);
    }
  }, [open, topic.signature, form]);

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
          <DialogTitle>{t("claimTopics.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("claimTopics.edit.description")}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <div className="space-y-4">
            {/* Display topic name as read-only info, not as a form field */}
            <div className="space-y-2">
              <Label>{t("claimTopics.edit.fields.name.label")}</Label>
              <Input
                value={topic.name}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t("claimTopics.edit.fields.name.description", {
                  topicId: Number(topic.topicId),
                })}
              </p>
            </div>

            <form.AppField
              name="signature"
              children={(field) => (
                <field.TextField
                  label={t("claimTopics.edit.fields.signature.label")}
                  required={true}
                  placeholder={t(
                    "claimTopics.edit.fields.signature.placeholder"
                  )}
                  description={t(
                    "claimTopics.edit.fields.signature.description"
                  )}
                />
              )}
            />
            <div className="text-xs text-muted-foreground">
              <p>
                {t("claimTopics.edit.fields.signature.current", {
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
              {t("claimTopics.edit.actions.cancel")}
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? t("claimTopics.edit.actions.updating")
                : t("claimTopics.edit.actions.update")}
            </form.VerificationButton>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
