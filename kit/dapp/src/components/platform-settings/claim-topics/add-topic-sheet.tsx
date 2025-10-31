import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionFormSheet } from "@/components/manage-dropdown/core/action-form-sheet";
import { createActionFormStore } from "@/components/manage-dropdown/core/action-form-sheet.store";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import {
  TopicCreateInputSchema,
  type TopicCreateInput,
} from "@/orpc/routes/system/claim-topics/routes/topic.create.schema";
import type { TopicScheme } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

// Form-level schema that validates only editable fields.
const AddTopicFormSchema = TopicCreateInputSchema.omit({
  walletVerification: true,
});

type AddTopicFormValues = z.infer<typeof AddTopicFormSchema>;

/**
 * Sheet component for adding new claim topics
 * Allows administrators to create custom topics for identity verification
 */
export function AddTopicSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["claim-topics-issuers", "common", "errors"]);

  const sheetStoreRef = useRef(
    createActionFormStore({
      hasValuesStep: true,
    })
  );

  const normalizeName = (value: string) =>
    value.normalize("NFKC").trim().toLowerCase();
  const getExistingTopics = (): TopicScheme[] => {
    return (
      queryClient.getQueryData(orpc.system.claimTopics.topicList.queryKey()) ??
      []
    );
  };

  const createMutation = useMutation({
    mutationFn: (data: TopicCreateInput) =>
      client.system.claimTopics.topicCreate(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.system.claimTopics.topicList.queryKey(),
      });
      handleClose();
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      signature: "",
    } satisfies AddTopicFormValues,
    validators: {
      onChange: AddTopicFormSchema,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (open) {
      form.reset();
      sheetStoreRef.current.setState((state) => ({
        ...state,
        step: "values",
      }));
    }
  }, [open, form]);

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
        values: state.values as Partial<AddTopicFormValues>,
        errors: state.errors,
      })}
    >
      {({ values, errors }) => {
        const name = values.name ?? "";
        const signature = values.signature ?? "";
        const sanitizedName = name.trim();
        const sanitizedSignature = signature.trim();

        const duplicateName = (() => {
          if (!sanitizedName) return false;
          const normalizedInput = normalizeName(sanitizedName);
          return getExistingTopics().some(
            (topic) => normalizeName(topic.name) === normalizedInput
          );
        })();

        const hasFieldErrors =
          Object.keys(errors ?? {}).length > 0 || duplicateName;

        const canContinue = () =>
          Boolean(sanitizedName && sanitizedSignature && !hasFieldErrors);

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("claimTopics.add.confirmation.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("claimTopics.add.fields.name.label")}
                </p>
                <p className="font-medium">{sanitizedName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("claimTopics.add.fields.signature.label")}
                </p>
                <p className="font-medium break-words">{sanitizedSignature}</p>
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
            title={t("claimTopics.add.title")}
            description={t("claimTopics.add.description")}
            submitLabel={
              createMutation.isPending
                ? t("claimTopics.add.actions.creating")
                : t("claimTopics.add.actions.create")
            }
            isSubmitting={createMutation.isPending}
            disabled={() => createMutation.isPending}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const payload: TopicCreateInput = {
                name: sanitizedName,
                signature: sanitizedSignature,
                walletVerification: verification,
              };

              const normalizedInput = normalizeName(payload.name);
              const duplicate = getExistingTopics().some(
                (topic) => normalizeName(topic.name) === normalizedInput
              );

              if (duplicate) {
                toast.error(t("errors:resourceAlreadyExists.description"));
                return;
              }

              toast
                .promise(createMutation.mutateAsync(payload), {
                  loading: t("common:saving"),
                  success: t("claimTopics.toast.created", {
                    name: payload.name,
                  }),
                  error: (error) =>
                    t("claimTopics.toast.createError", {
                      error:
                        error.message || error.toString() || "Unknown error",
                    }),
                })
                .unwrap()
                .then(() => {
                  handleClose();
                })
                .catch(() => undefined);
            }}
          >
            <div className="space-y-4">
              <form.AppField name="name">
                {(field) => (
                  <div className="space-y-1">
                    <field.TextField
                      label={t("claimTopics.add.fields.name.label")}
                      required
                      description={t("claimTopics.add.fields.name.description")}
                    />
                    {duplicateName && (
                      <p className="text-xs text-destructive">
                        {t("errors:resourceAlreadyExists.description")}
                      </p>
                    )}
                  </div>
                )}
              </form.AppField>

              <form.AppField name="signature">
                {(field) => (
                  <field.TextField
                    label={t("claimTopics.add.fields.signature.label")}
                    required
                    placeholder={t(
                      "claimTopics.add.fields.signature.placeholder"
                    )}
                    description={t(
                      "claimTopics.add.fields.signature.description"
                    )}
                  />
                )}
              </form.AppField>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
