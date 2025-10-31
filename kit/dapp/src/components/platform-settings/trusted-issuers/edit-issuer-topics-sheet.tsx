import { ActionFormSheet } from "@/components/manage-dropdown/core/action-form-sheet";
import { createActionFormStore } from "@/components/manage-dropdown/core/action-form-sheet.store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiselect";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { TopicListOutput } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import type { TrustedIssuer } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list.schema";
import type { TrustedIssuerUpdateInput } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.update.schema";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface EditIssuerTopicsSheetProps {
  issuer: TrustedIssuer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sheet component for editing trusted issuer topics
 * Allows administrators to update the topics an issuer can verify
 */
export function EditIssuerTopicsSheet({
  issuer,
  open,
  onOpenChange,
}: EditIssuerTopicsSheetProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["claim-topics-issuers", "common"]);
  const sheetStoreRef = useRef(
    createActionFormStore({
      hasValuesStep: true,
    })
  );

  // Fetch available topics for selection
  const { data: topics } = useSuspenseQuery(
    orpc.system.claimTopics.topicList.queryOptions()
  ) as { data: TopicListOutput };

  // Update issuer topics mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      claimTopicIds: string[];
      walletVerification: UserVerification;
    }) =>
      client.system.trustedIssuers.update({
        ...data,
        issuerAddress: issuer.id,
      } as TrustedIssuerUpdateInput),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.system.trustedIssuers.list.queryKey(),
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      claimTopicIds: issuer.claimTopics.map((topic) => topic.topicId),
    },
    onSubmit: () => {},
  });

  // Reset form when issuer changes
  useEffect(() => {
    if (open) {
      form.setFieldValue(
        "claimTopicIds",
        issuer.claimTopics.map((topic) => topic.topicId)
      );
      sheetStoreRef.current.setState((state) => ({
        ...state,
        step: "values",
      }));
    }
  }, [open, issuer.claimTopics, form]);

  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((state) => ({
      ...state,
      step: "values",
    }));
    onOpenChange(false);
  };

  // Create a lookup map for O(1) topic retrieval and options
  const { topicLookup, topicOptions } = useMemo(() => {
    const lookup = new Map(topics.map((topic) => [topic.topicId, topic.name]));
    const options = topics.map((topic) => ({
      value: topic.topicId,
      label: topic.name,
    }));
    return { topicLookup: lookup, topicOptions: options };
  }, [topics]);

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values as { claimTopicIds?: string[] },
        errors: state.errors,
      })}
    >
      {({ values, errors }) => {
        const selectedTopicIds = values.claimTopicIds ?? [];
        const hasSelection = selectedTopicIds.length > 0;
        const currentTopics = issuer.claimTopics.map((topic) => topic.topicId);
        const sortedSelected = [...selectedTopicIds].toSorted();
        const sortedCurrent = [...currentTopics].toSorted();
        const hasChanged =
          sortedSelected.length !== sortedCurrent.length ||
          sortedSelected.some((id, index) => sortedCurrent[index] !== id);
        const hasErrors = Object.keys(errors ?? {}).length > 0;

        const canContinue = () => hasSelection && hasChanged && !hasErrors;

        const selectedTopicNames = selectedTopicIds.map((id) => ({
          id,
          name: topicLookup.get(id) ?? id,
        }));

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("trustedIssuers.edit.confirmation.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("trustedIssuers.edit.fields.issuerAddress.label")}
                </p>
                <p className="font-mono text-xs">{issuer.id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t("trustedIssuers.edit.fields.claimTopics.label")}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedTopicNames.map(({ id, name }) => (
                    <Badge key={id}>{name}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("trustedIssuers.edit.fields.claimTopics.current", {
                    topics: issuer.claimTopics
                      .map((topic) => topic.name)
                      .join(", "),
                  })}
                </p>
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
            title={t("trustedIssuers.edit.title")}
            description={t("trustedIssuers.edit.description")}
            submitLabel={
              updateMutation.isPending
                ? t("trustedIssuers.edit.actions.updating")
                : t("trustedIssuers.edit.actions.update")
            }
            isSubmitting={updateMutation.isPending}
            disabled={() => updateMutation.isPending}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              if (!hasSelection) {
                toast.error(
                  t("trustedIssuers.edit.validation.required", {
                    defaultValue: t(
                      "trustedIssuers.add.fields.claimTopics.validation.required"
                    ),
                  })
                );
                return;
              }

              toast
                .promise(
                  updateMutation.mutateAsync({
                    claimTopicIds: selectedTopicIds,
                    walletVerification: verification,
                  }),
                  {
                    loading: t("common:saving"),
                    success: t("trustedIssuers.toast.updated"),
                    error: (data) =>
                      t("common:error", { message: data.message }),
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
                <Label>
                  {t("trustedIssuers.edit.fields.issuerAddress.label")}
                </Label>
                <Input
                  value={issuer.id}
                  readOnly
                  disabled
                  className="bg-muted font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {t("trustedIssuers.edit.fields.issuerAddress.description")}
                </p>
              </div>

              <form.AppField name="claimTopicIds">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="claimTopicIds">
                      {t("trustedIssuers.edit.fields.claimTopics.label")}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <MultipleSelector
                      value={(field.state.value ?? []).map((id: string) => ({
                        value: id,
                        label: topicLookup.get(id) || id,
                      }))}
                      onChange={(options) => {
                        field.handleChange(options.map((o) => o.value));
                      }}
                      defaultOptions={topicOptions}
                      placeholder={t(
                        "trustedIssuers.edit.fields.claimTopics.placeholder"
                      )}
                      emptyIndicator={
                        <p className="text-center text-sm">
                          {t("trustedIssuers.edit.fields.claimTopics.empty")}
                        </p>
                      }
                      onSearch={(value) => {
                        return Promise.resolve(
                          topicOptions.filter((option) =>
                            option.label
                              .toLowerCase()
                              .includes(value.toLowerCase())
                          )
                        );
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("trustedIssuers.edit.fields.claimTopics.description")}
                    </p>
                    {!hasSelection && (
                      <p className="text-sm text-destructive">
                        {t("trustedIssuers.edit.validation.required", {
                          defaultValue: t(
                            "trustedIssuers.add.fields.claimTopics.validation.required"
                          ),
                        })}
                      </p>
                    )}
                  </div>
                )}
              </form.AppField>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
