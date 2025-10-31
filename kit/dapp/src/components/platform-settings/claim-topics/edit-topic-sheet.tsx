import { ActionFormSheet } from "@/components/manage-dropdown/core/action-form-sheet";
import { createActionFormStore } from "@/components/manage-dropdown/core/action-form-sheet.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppForm } from "@/hooks/use-app-form";
import { normalizeAbiSignature } from "@/lib/utils/abi-signature";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

// Form schema with only editable fields
const EditTopicFormSchema = z.object({
  signature: z
    .string()
    .min(1, "Signature is required")
    .describe("New claim data ABI types for claim verification")
    .refine((val) => !val.includes("(") && !val.includes(")"), {
      message: "Remove parentheses; use a comma-separated type list.",
    })
    .transform(normalizeAbiSignature),
});

interface EditTopicSheetProps {
  topic: TopicScheme;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sheet component for editing claim topic signatures
 * Allows administrators to update the verification signature for custom topics
 */
export function EditTopicSheet({
  topic,
  open,
  onOpenChange,
}: EditTopicSheetProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["claim-topics-issuers", "common"]);
  const sheetStoreRef = useRef(
    createActionFormStore({
      hasValuesStep: true,
    })
  );

  // Update topic mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      signature: string;
      walletVerification: UserVerification;
    }) =>
      client.system.claimTopics.topicUpdate({
        ...data,
        name: topic.name,
      }),
    onSuccess: () => {
      // Invalidate and refetch topics data
      void queryClient.invalidateQueries({
        queryKey: orpc.system.claimTopics.topicList.queryKey(),
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      signature: topic.signature,
    } satisfies z.infer<typeof EditTopicFormSchema>,
    validators: {
      onChange: EditTopicFormSchema,
    },
    onSubmit: () => {},
  });

  // Reset form when topic changes
  useEffect(() => {
    if (open) {
      form.setFieldValue("signature", topic.signature);
      sheetStoreRef.current.setState((state) => ({
        ...state,
        step: "values",
      }));
    }
  }, [open, topic.signature, form]);

  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((state) => ({
      ...state,
      step: "values",
    }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values as Partial<z.infer<typeof EditTopicFormSchema>>,
        errors: state.errors,
      })}
    >
      {({ values, errors }) => {
        const signature = values.signature ?? "";
        const sanitizedSignature = signature.trim();
        const hasChanged = sanitizedSignature !== topic.signature;
        const hasErrors = Object.keys(errors ?? {}).length > 0;

        const canContinue = () => hasChanged && !hasErrors;

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("claimTopics.edit.confirmation.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("claimTopics.edit.fields.name.label")}
                </p>
                <p className="font-medium">{topic.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("claimTopics.edit.fields.signature.label")}
                </p>
                <div className="space-y-1">
                  <p className="font-medium break-words">
                    {sanitizedSignature}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("claimTopics.edit.fields.signature.previous", {
                      signature: topic.signature,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                handleClose();
              }
            }}
            title={t("claimTopics.edit.title")}
            description={t("claimTopics.edit.description")}
            submitLabel={
              updateMutation.isPending
                ? t("claimTopics.edit.actions.updating")
                : t("claimTopics.edit.actions.update")
            }
            isSubmitting={updateMutation.isPending}
            disabled={() => updateMutation.isPending}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              if (!hasChanged) {
                toast.error(t("claimTopics.edit.validation.signatureChanged"));
                return;
              }

              toast
                .promise(
                  updateMutation.mutateAsync({
                    signature: sanitizedSignature,
                    walletVerification: verification,
                  }),
                  {
                    loading: t("common:saving"),
                    success: t("claimTopics.toast.updated", {
                      name: topic.name,
                    }),
                    error: (error) =>
                      t("claimTopics.toast.updateError", {
                        error: error.message,
                      }),
                  }
                )
                .unwrap()
                .then(() => {
                  handleClose();
                })
                .catch(() => undefined);
            }}
          >
            <div className="space-y-4">
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

              <form.AppField name="signature">
                {(field) => (
                  <field.TextField
                    label={t("claimTopics.edit.fields.signature.label")}
                    required
                    placeholder={t(
                      "claimTopics.edit.fields.signature.placeholder"
                    )}
                    description={t(
                      "claimTopics.edit.fields.signature.description"
                    )}
                  />
                )}
              </form.AppField>
              <p className="text-xs text-muted-foreground">
                {t("claimTopics.edit.fields.signature.current", {
                  signature: topic.signature,
                })}
              </p>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
