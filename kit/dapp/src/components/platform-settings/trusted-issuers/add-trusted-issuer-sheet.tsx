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
import {
  TrustedIssuerCreateInputSchema,
  type TrustedIssuerCreateInput,
} from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.create.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useStore } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AddTrustedIssuerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
      void queryClient.invalidateQueries({
        queryKey: orpc.system.trustedIssuers.list.queryKey(),
      });
      onOpenChange(false);
      form.reset(createDefaultFormValues());
    },
  });

  type AddTrustedIssuerFormValues = {
    issuerAddress?: EthereumAddress;
    claimTopicIds: string[];
    walletVerification: UserVerification;
  };

  const createDefaultFormValues = (): AddTrustedIssuerFormValues => ({
    issuerAddress: undefined,
    claimTopicIds: [],
    walletVerification: {
      secretVerificationCode: "",
      verificationType: "PINCODE",
    },
  });

  const form = useAppForm({
    defaultValues: createDefaultFormValues(),
    onSubmit: ({ value }) => {
      const { issuerAddress, claimTopicIds, walletVerification } =
        TrustedIssuerCreateInputSchema.parse(value);

      const action = (async () => {
        if (!issuerAddress) {
          throw new Error("Issuer address is required before submission");
        }

        const missingIdentityErrorMessage = t(
          "trustedIssuers.add.errors.identityRequired",
          {
            defaultValue:
              "The selected user must register an identity before they can be added as a trusted issuer.",
          }
        );

        const trustedIssuerIdentity = await client.system.identity
          .read({
            wallet: issuerAddress,
          })
          .catch((error: unknown) => {
            const maybeOrpcError = error as {
              code?: string;
            };

            if (maybeOrpcError?.code === "NOT_FOUND") {
              throw new Error(missingIdentityErrorMessage);
            }

            throw error;
          });

        if (!trustedIssuerIdentity) {
          throw new Error(missingIdentityErrorMessage);
        }

        const payload = TrustedIssuerCreateInputSchema.parse({
          issuerAddress: trustedIssuerIdentity.id,
          claimTopicIds,
          walletVerification,
        });

        return createMutation.mutateAsync(payload);
      })();

      return toast.promise(action, {
        loading: t("common:saving"),
        success: t("trustedIssuers.toast.added"),
        error: (data) => t("common:error", { message: data.message }),
      });
    },
  });

  const handleClose = () => {
    form.reset(createDefaultFormValues());
    onOpenChange(false);
  };

  const handleSubmit = () => {
    void form.handleSubmit();
  };

  const issuerAddress = useStore(
    form.store,
    (state) => state.values.issuerAddress
  );
  const claimTopicIds = useStore(
    form.store,
    (state) => state.values.claimTopicIds
  );
  const hasSelectedTopics = Array.isArray(claimTopicIds)
    ? claimTopicIds.length > 0
    : false;

  // Keep a stable reference to the form instance for effects
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const validateClaimTopicsSelection = (
    topics: string[] | undefined,
    issuer?: EthereumAddress
  ) => {
    if (issuer && (!topics || topics.length === 0)) {
      return t("trustedIssuers.add.fields.claimTopics.validation.required");
    }
    return undefined;
  };

  useEffect(() => {
    if (!issuerAddress) {
      const currentTopics = formRef.current.getFieldValue("claimTopicIds");
      if (Array.isArray(currentTopics) && currentTopics.length > 0) {
        formRef.current.setFieldValue("claimTopicIds", []);
      }
    }
  }, [issuerAddress]);

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

              <form.AppField
                name="claimTopicIds"
                validators={{
                  onChange: ({ value }) =>
                    validateClaimTopicsSelection(
                      value,
                      form.getFieldValue("issuerAddress") as
                        | EthereumAddress
                        | undefined
                    ),
                  onSubmit: ({ value }) =>
                    validateClaimTopicsSelection(
                      value,
                      form.getFieldValue("issuerAddress") as
                        | EthereumAddress
                        | undefined
                    ),
                }}
                children={(field) => {
                  const canSelectTopics = Boolean(issuerAddress);
                  const selectedTopicIds = Array.isArray(field.state.value)
                    ? field.state.value
                    : [];

                  return (
                    <div className="space-y-2">
                      <Label htmlFor="claimTopicIds">
                        {t("trustedIssuers.add.fields.claimTopics.label")}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      {!canSelectTopics && (
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "trustedIssuers.add.fields.claimTopics.helperIssuerMissing"
                          )}
                        </p>
                      )}
                      <MultipleSelector
                        value={selectedTopicIds.map((id: string) => ({
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
                        onSearch={(value) => {
                          return Promise.resolve(
                            topicOptions.filter((option) =>
                              option.label
                                .toLowerCase()
                                .includes(value.toLowerCase())
                            )
                          );
                        }}
                        disabled={!canSelectTopics}
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
                  );
                }}
              />
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
                  !issuerAddress ||
                  !hasSelectedTopics ||
                  createMutation.isPending
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
