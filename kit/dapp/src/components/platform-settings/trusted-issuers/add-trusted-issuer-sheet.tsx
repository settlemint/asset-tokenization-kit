import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { ActionFormSheet } from "@/components/manage-dropdown/core/action-form-sheet";
import { createActionFormStore } from "@/components/manage-dropdown/core/action-form-sheet.store";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiselect";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import { isOrpcNotFoundError } from "@/orpc/helpers/error";
import { client, orpc } from "@/orpc/orpc-client";
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
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AddTrustedIssuerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Reuse the trusted issuer input schema while keeping issuerAddress optional until the user picks one.
type TrustedIssuerFormValues = Omit<
  TrustedIssuerCreateInput,
  "issuerAddress" | "walletVerification"
> & {
  issuerAddress?: EthereumAddress;
};

export function AddTrustedIssuerSheet({
  open,
  onOpenChange,
}: AddTrustedIssuerSheetProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["claim-topics-issuers", "common"]);
  const sheetStoreRef = useRef(
    createActionFormStore({ hasValuesStep: true })
  );

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
    },
  });

  const createDefaultFormValues = (): TrustedIssuerFormValues => ({
    issuerAddress: undefined,
    claimTopicIds: [],
  });

  const form = useAppForm({
    defaultValues: createDefaultFormValues(),
    onSubmit: () => {
      // Submission handled via ActionFormSheet onSubmit callback
    },
  });

  const resetFormState = useCallback(() => {
    form.reset(createDefaultFormValues());
    sheetStoreRef.current.setState((state) => ({
      ...state,
      step: "values",
    }));
  }, [form]);

  useEffect(() => {
    if (open) {
      resetFormState();
    }
  }, [open, resetFormState]);

  const handleClose = () => {
    resetFormState();
    onOpenChange(false);
  };

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetFormState();
    }
    onOpenChange(nextOpen);
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
      const currentTopics = form.getFieldValue("claimTopicIds");
      if (Array.isArray(currentTopics) && currentTopics.length > 0) {
        form.setFieldValue("claimTopicIds", []);
      }
    }
  }, [issuerAddress, form]);

  // Create a lookup map for O(1) topic retrieval and options
  const { topicLookup, topicOptions } = useMemo(() => {
    const lookup = new Map(topics.map((topic) => [topic.topicId, topic.name]));
    const options = topics.map((topic) => ({
      value: topic.topicId,
      label: topic.name,
    }));
    return { topicLookup: lookup, topicOptions: options };
  }, [topics]);

  const selectedTopicIds = Array.isArray(claimTopicIds)
    ? claimTopicIds
    : [];

  const confirmView = (
    <div className="space-y-4">
      <div className="rounded-md border p-4 space-y-2">
        <span className="text-xs text-muted-foreground">
          {t("trustedIssuers.add.fields.selectUser.label")}
        </span>
        {issuerAddress ? (
          <Web3Address address={issuerAddress} size="small" />
        ) : (
          <span className="text-sm text-muted-foreground">
            {t("common:unknown")}
          </span>
        )}
      </div>
      <div className="rounded-md border p-4 space-y-2">
        <span className="text-xs text-muted-foreground">
          {t("trustedIssuers.add.fields.claimTopics.label")}
        </span>
        {selectedTopicIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedTopicIds.map((id) => (
              <Badge key={id} variant="secondary">
                {topicLookup.get(id) ?? id}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {t("trustedIssuers.add.fields.claimTopics.empty")}
          </span>
        )}
      </div>
    </div>
  );

  const canContinue = () => Boolean(issuerAddress) && hasSelectedTopics;

  return (
    <ActionFormSheet
      open={open}
      onOpenChange={handleSheetOpenChange}
      title={t("trustedIssuers.add.title")}
      description={t("trustedIssuers.add.selectUserDescription")}
      submitLabel={
        createMutation.isPending
          ? t("trustedIssuers.add.actions.adding")
          : t("trustedIssuers.add.actions.add")
      }
      canContinue={canContinue}
      confirm={confirmView}
      showAssetDetailsOnConfirm={false}
      isSubmitting={createMutation.isPending}
      store={sheetStoreRef.current}
      onSubmit={(verification) => {
        const action = (async () => {
          if (!issuerAddress) {
            throw new Error(
              "Issuer address is required before submission"
            );
          }

          const missingIdentityErrorMessage = t(
            "trustedIssuers.add.errors.identityRequired",
            {
              defaultValue:
                "The selected user must register an identity before they can be added as a trusted issuer.",
            }
          );

          const trustedIssuerIdentity = await client.system.identity
            .readByWallet({
              wallet: issuerAddress,
            })
            .catch((error: unknown) => {
              if (isOrpcNotFoundError(error)) {
                throw new Error(missingIdentityErrorMessage);
              }

              throw error;
            });

          if (!trustedIssuerIdentity) {
            throw new Error(missingIdentityErrorMessage);
          }

          const parseResult = TrustedIssuerCreateInputSchema.safeParse({
            issuerAddress: trustedIssuerIdentity.id,
            claimTopicIds: selectedTopicIds,
            walletVerification: verification,
          });

          if (!parseResult.success) {
            throw new Error(parseResult.error.message);
          }

          return createMutation.mutateAsync(parseResult.data);
        })();

        toast
          .promise(action, {
            loading: t("common:saving"),
            success: t("trustedIssuers.toast.added"),
            error: (data) => t("common:error", { message: data.message }),
          })
          .unwrap()
          .then(() => {
            handleClose();
          })
          .catch(() => undefined);
      }}
    >
      <div className="space-y-6">
        <AddressSelectOrInputToggle>
          {({ mode }) => (
            <>
              {mode === "select" && (
                <form.AppField name="issuerAddress">
                  {(field) => (
                    <field.AddressSelectField
                      scope="user"
                      label={t("trustedIssuers.add.fields.selectUser.label")}
                      required={true}
                      description={t(
                        "trustedIssuers.add.fields.selectUser.description"
                      )}
                    />
                  )}
                </form.AppField>
              )}
              {mode === "manual" && (
                <form.AppField name="issuerAddress">
                  {(field) => (
                    <field.AddressInputField
                      label={t("trustedIssuers.add.fields.selectUser.label")}
                      required={true}
                      description={t(
                        "trustedIssuers.add.fields.selectUser.description"
                      )}
                    />
                  )}
                </form.AppField>
              )}
            </>
          )}
        </AddressSelectOrInputToggle>

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
        >
          {(field) => {
            const canSelectTopics = Boolean(issuerAddress);
            const selectedIds = Array.isArray(field.state.value)
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
                  value={selectedIds.map((id: string) => ({
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
                        option.label.toLowerCase().includes(value.toLowerCase())
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
        </form.AppField>
      </div>
    </ActionFormSheet>
  );
}
