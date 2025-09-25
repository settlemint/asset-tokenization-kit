import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiselect";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppForm } from "@/hooks/use-app-form";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { TopicListOutput } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import type { TrustedIssuerCreateInput } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.create.schema";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AddTrustedIssuerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sheet component for adding new trusted issuers
 * Allows administrators to select existing users and assign them as trusted issuers with selected topics
 */
export function AddTrustedIssuerSheet({
  open,
  onOpenChange,
}: AddTrustedIssuerSheetProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["claim-topics-issuers", "common"]);

  // Fetch available topics for selection
  const { data: topics } = useSuspenseQuery(
    orpc.system.claimTopics.topicList.queryOptions()
  ) as { data: TopicListOutput };

  // Create trusted issuer mutation
  const createMutation = useMutation({
    mutationFn: (data: TrustedIssuerCreateInput) =>
      client.system.trustedIssuers.create(data),
    onSuccess: () => {
      toast.success(t("trustedIssuers.toast.added"));
      void queryClient.invalidateQueries({
        queryKey: orpc.system.trustedIssuers.list.queryKey(),
      });
      onOpenChange(false);
      form.reset();
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
      const promise = async () => {
        const trustedIssuerIdentity = await client.system.identity.read({
          wallet: value.issuerAddress,
        });
        if (!trustedIssuerIdentity) {
          throw new Error("Trusted issuer identity not found");
        }

        return createMutation.mutateAsync({
          issuerAddress: trustedIssuerIdentity.id,
          claimTopicIds: value.claimTopicIds,
          walletVerification: value.walletVerification,
        });
      };

      toast.promise(promise, {
        loading: t("common:saving"),
        success: t("common:saved"),
        error: (data) => t("common:error", { message: data.message }),
      });
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
    const lookup = new Map(topics.map((topic) => [topic.topicId, topic.name]));
    const options = topics.map((topic) => ({
      value: topic.topicId,
      label: topic.name,
    }));
    return { topicLookup: lookup, topicOptions: options };
  }, [topics]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("trustedIssuers.add.title")}</SheetTitle>
          <SheetDescription>
            {t("trustedIssuers.add.selectUserDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 px-6">
          <form.AppForm>
            <div className="space-y-6">
              <AddressSelectOrInputToggle
                children={({ mode }) => (
                  <>
                    {mode === "select" && (
                      <form.AppField
                        name="issuerAddress"
                        children={(field) => (
                          <field.AddressSelectField
                            scope="user"
                            label={t(
                              "trustedIssuers.add.fields.selectUser.label"
                            )}
                            required={true}
                            description={t(
                              "trustedIssuers.add.fields.selectUser.description"
                            )}
                          />
                        )}
                      />
                    )}
                    {mode === "manual" && (
                      <form.AppField
                        name="issuerAddress"
                        children={(field) => (
                          <field.AddressInputField
                            label={t(
                              "trustedIssuers.add.fields.selectUser.label"
                            )}
                            required={true}
                            description={t(
                              "trustedIssuers.add.fields.selectUser.description"
                            )}
                          />
                        )}
                      />
                    )}
                  </>
                )}
              />

              {form.state.values.issuerAddress && (
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
                          label: topicLookup.get(id) || id,
                        }))}
                        onChange={(options) => {
                          field.handleChange(options.map((o) => o.value));
                        }}
                        defaultOptions={topicOptions}
                        placeholder={t(
                          "trustedIssuers.add.fields.claimTopics.placeholder"
                        )}
                        emptyIndicator={
                          <p className="text-center text-sm">
                            {t("trustedIssuers.add.fields.claimTopics.empty")}
                          </p>
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
              )}
            </div>

            <SheetFooter className="mt-8">
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
                disabled={
                  !form.state.values.issuerAddress || createMutation.isPending
                }
              >
                {createMutation.isPending
                  ? t("trustedIssuers.add.actions.adding")
                  : t("trustedIssuers.add.actions.add")}
              </form.VerificationButton>
            </SheetFooter>
          </form.AppForm>
        </div>
      </SheetContent>
    </Sheet>
  );
}
