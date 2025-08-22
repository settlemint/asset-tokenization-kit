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
import MultipleSelector from "@/components/ui/multiselect";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { TrustedIssuer } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list.schema";
import type { TrustedIssuerUpdateInput } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.update.schema";
import type { TopicListOutput } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface EditIssuerTopicsDialogProps {
  issuer: TrustedIssuer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for editing trusted issuer topics
 * Allows administrators to update the topics an issuer can verify
 */
export function EditIssuerTopicsDialog({
  issuer,
  open,
  onOpenChange,
}: EditIssuerTopicsDialogProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("claim-topics-issuers");

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
      toast.success(t("trustedIssuers.toast.updated"));
      void queryClient.invalidateQueries({
        queryKey: orpc.system.trustedIssuers.list.queryKey(),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(
        t("trustedIssuers.toast.updateError", {
          error: error.message || error.toString() || "Unknown error",
        })
      );
    },
  });

  const form = useAppForm({
    defaultValues: {
      claimTopicIds: issuer.claimTopics.map((topic) => topic.topicId),
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE" as const,
      } as UserVerification,
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  // Reset form when issuer changes
  useEffect(() => {
    if (open) {
      form.setFieldValue(
        "claimTopicIds",
        issuer.claimTopics.map((topic) => topic.topicId)
      );
    }
  }, [open, issuer.claimTopics, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    void form.handleSubmit();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("trustedIssuers.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("trustedIssuers.edit.description")}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <div className="space-y-4">
            {/* Display issuer address as read-only info */}
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

            <form.AppField
              name="claimTopicIds"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="claimTopicIds">
                    {t("trustedIssuers.edit.fields.claimTopics.label")}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <MultipleSelector
                    value={field.state.value.map((id: string) => ({
                      value: id,
                      label: topicLookup.get(id) || id,
                    }))}
                    onChange={(options) => {
                      field.handleChange(options.map((o) => o.value));
                    }}
                    defaultOptions={topicOptions}
                    placeholder="Select topics..."
                    emptyIndicator={
                      <p className="text-center text-sm">No topics available</p>
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("trustedIssuers.edit.fields.claimTopics.description")}
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            />

            <div className="text-xs text-muted-foreground">
              <p>
                {t("trustedIssuers.edit.fields.claimTopics.current", {
                  topics: issuer.claimTopics
                    .map((topic) => topic.name)
                    .join(", "),
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
              {t("trustedIssuers.edit.actions.cancel")}
            </Button>
            <form.VerificationButton
              onSubmit={handleSubmit}
              walletVerification={{
                title: t("trustedIssuers.edit.verification.title"),
                description: t("trustedIssuers.edit.verification.description"),
                setField: (verification) => {
                  form.setFieldValue("walletVerification", verification);
                },
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? t("trustedIssuers.edit.actions.updating")
                : t("trustedIssuers.edit.actions.update")}
            </form.VerificationButton>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
