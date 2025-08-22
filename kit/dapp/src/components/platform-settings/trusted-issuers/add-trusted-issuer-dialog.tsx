import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiselect";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { TrustedIssuerCreateInput } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.create.schema";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";


interface AddTrustedIssuerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for adding new trusted issuers
 * Allows administrators to create trusted issuers with selected topics
 */
export function AddTrustedIssuerDialog({
  open,
  onOpenChange,
}: AddTrustedIssuerDialogProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("claim-topics-issuers");

  // Fetch available topics for selection
  const { data: topics } = useSuspenseQuery(
    orpc.system.topicList.queryOptions()
  );

  // Create trusted issuer mutation
  const createMutation = useMutation({
    mutationFn: (data: TrustedIssuerCreateInput) =>
      client.system.trustedIssuerCreate(data),
    onSuccess: () => {
      toast.success(t("trustedIssuers.toast.added"));
      void queryClient.invalidateQueries({
        queryKey: orpc.system.trustedIssuerList.queryKey(),
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(
        t("trustedIssuers.toast.addError", {
          error: error.message || error.toString() || "Unknown error",
        })
      );
    },
  });

  const form = useAppForm({
    defaultValues: {
      issuerAddress: "0x" as `0x${string}`,
      claimTopicIds: [] as string[],
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE" as const,
      } as UserVerification,
    },
    onSubmit: ({ value }) => {
      createMutation.mutate(value as TrustedIssuerCreateInput);
    },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    void form.handleSubmit();
  };

  // Create a lookup map for O(1) topic retrieval and options
  const { topicLookup, topicOptions } = useMemo(() => {
    const lookup = new Map(topics.map(topic => [topic.topicId, topic.name]));
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
          <DialogTitle>{t("trustedIssuers.add.title")}</DialogTitle>
          <DialogDescription>
            {t("trustedIssuers.add.description")}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <div className="space-y-4">
            <form.AppField
              name="issuerAddress"
              children={(field) => (
                <field.TextField
                  label={t("trustedIssuers.add.fields.issuerAddress.label")}
                  required={true}
                  description={t(
                    "trustedIssuers.add.fields.issuerAddress.description"
                  )}
                />
              )}
            />

            <form.AppField
              name="claimTopicIds"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="claimTopicIds">
                    {t("trustedIssuers.add.fields.claimTopics.label")}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <MultipleSelector
                    value={field.state.value.map((id: string) => ({
                      value: id,
                      label: topicLookup.get(id) || id
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
                    {t("trustedIssuers.add.fields.claimTopics.description")}
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
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
              {t("trustedIssuers.add.actions.cancel")}
            </Button>
            <form.VerificationButton
              onSubmit={handleSubmit}
              walletVerification={{
                title: t("trustedIssuers.add.verification.title"),
                description: t("trustedIssuers.add.verification.description"),
                setField: (verification) => {
                  form.setFieldValue("walletVerification", verification);
                },
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? t("trustedIssuers.add.actions.adding")
                : t("trustedIssuers.add.actions.add")}
            </form.VerificationButton>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}