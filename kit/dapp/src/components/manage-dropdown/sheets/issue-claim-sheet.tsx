import { useAppForm } from "@/hooks/use-app-form";
import {
  buildClaimData,
  generateFormFields,
  getSchemaForClaim,
} from "@/lib/utils/claims/claim-schema-builder";
import { orpc } from "@/orpc/orpc-client";
import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { IssueableClaimTopicSchema } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";
import type { ManagedIdentity } from "../manage-identity-dropdown";
import { ConfirmIssueClaimView } from "./issue-claim/ConfirmIssueClaimView";
import { IssueClaimFormView } from "./issue-claim/IssueClaimFormView";

const IssueClaimFormSchema = z
  .object({
    topic: IssueableClaimTopicSchema.or(z.literal("")),
  })
  .catchall(z.unknown());

export type IssueClaimFormData = z.infer<typeof IssueClaimFormSchema>;

export type IssueClaimTopic = IssueClaimFormData["topic"];

/**
 * Creates initial form values dynamically based on the selected topic
 */
const createInitialValues = (
  topic?: string,
  signature?: string
): Record<string, unknown> => {
  const initialValues: Record<string, unknown> = {
    topic: topic || "",
  };

  if (topic) {
    try {
      const schema = getSchemaForClaim(topic, signature);
      if (schema) {
        const fields = generateFormFields(schema);
        for (const field of fields) {
          switch (field.type) {
            case "boolean":
            case "checkbox":
              initialValues[field.name] = false;
              break;
            case "number":
            case "bigint":
              initialValues[field.name] = "";
              break;
            default:
              initialValues[field.name] = "";
          }
        }
      }
    } catch (error) {
      console.error("Failed to create initial values:", error);
    }
  }

  return initialValues;
};

const fromDateTimeInput = (value: string): string => {
  if (!value) return "";
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) return "";
  return String(Math.floor(ms / 1000));
};

const toDateTimeInputValue = (timestamp: string | undefined): string => {
  if (!timestamp) return "";
  const seconds = Number.parseInt(timestamp, 10);
  if (Number.isNaN(seconds)) return "";
  const date = new Date(seconds * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Transforms form field values for datetime and number types
 */
const transformFieldValue = (value: unknown, fieldType: string): unknown => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  switch (fieldType) {
    case "datetime":
      return typeof value === "string" ? fromDateTimeInput(value) : value;
    case "number":
      if (typeof value === "string") {
        const numValue = Number.parseInt(value, 10);
        if (Number.isNaN(numValue)) {
          throw new TypeError(`Invalid number: "${value}"`);
        }
        return numValue;
      }
      return value;
    case "bigint":
      return value; // Keep as string for large numbers
    default:
      return value;
  }
};

/**
 * Builds a claim payload from form values using the schema-driven approach
 */
const buildClaimPayload = (
  values: Record<string, unknown>,
  topic: string,
  signature?: string
): ClaimData | null => {
  if (!topic) {
    return null;
  }

  try {
    const schema = getSchemaForClaim(topic, signature);
    if (!schema) {
      return null;
    }

    const fields = generateFormFields(schema);
    const transformedValues: Record<string, unknown> = {};

    // Transform field values based on their types
    for (const field of fields) {
      const rawValue = values[field.name];
      const transformedValue = transformFieldValue(rawValue, field.type);

      if (transformedValue !== undefined) {
        transformedValues[field.name] = transformedValue;
      }
    }

    // Use the schema-driven buildClaimData function
    return buildClaimData(topic, transformedValues, signature);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to build claim payload for topic "${topic}":`, error);
    return null;
  }
};

interface IssueClaimSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  identity: ManagedIdentity;
}

export function IssueClaimSheet({
  open,
  onOpenChange,
  identity,
}: IssueClaimSheetProps) {
  const { t } = useTranslation("identities");
  const queryClient = useQueryClient();
  const router = useRouter();
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const targetAddress = useMemo(
    () => getEthereumAddress(identity.identity),
    [identity.identity]
  );

  const { data: topics } = useQuery(
    orpc.system.claimTopics.topicList.queryOptions()
  );

  const { data: trustedIssuers } = useQuery(
    orpc.system.trustedIssuers.list.queryOptions()
  );

  const { mutateAsync: issueClaim, isPending } = useMutation(
    orpc.system.identity.claims.issue.mutationOptions({
      onSuccess: async () => {
        const identityQuery = orpc.system.identity.read.queryOptions({
          input: { wallet: identity.account.id },
        });
        const claimsQuery = orpc.system.identity.claims.list.queryOptions({
          input: { accountId: identity.account.id },
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: identityQuery.queryKey }),
          queryClient.invalidateQueries({ queryKey: claimsQuery.queryKey }),
        ]);

        toast.success(t("actions.issueClaim.success"));
        await router.invalidate();
        handleClose();
      },
      onError: (error) => {
        toast.error(t("actions.issueClaim.error", { error: error.message }));
      },
    })
  );

  const form = useAppForm({
    defaultValues: createInitialValues(),
    onSubmit: () => {},
  });

  const resetFormState = useCallback(() => {
    form.reset(createInitialValues());
    sheetStoreRef.current.setState((state) => ({ ...state, step: "values" }));
  }, [form]);

  const handleClose = () => {
    resetFormState();
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      resetFormState();
    }
  }, [open, resetFormState]);

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        const typedValues = IssueClaimFormSchema.parse(values);
        const selectedTopic: IssueClaimTopic =
          typedValues.topic === ""
            ? ""
            : (typedValues.topic as IssueClaimTopic);
        const selectedTopicData = topics?.find(
          (topic) => topic.name === selectedTopic
        );
        const claimPayload = buildClaimPayload(
          values,
          selectedTopic,
          selectedTopicData?.signature
        );
        const userCanIssueTopic = Boolean(
          selectedTopic &&
            trustedIssuers?.some((issuer) =>
              issuer.claimTopics.some((topic) => topic.name === selectedTopic)
            )
        );

        const canProceed = Boolean(claimPayload) && userCanIssueTopic;

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={handleClose}
            title={t("actions.issueClaim.title")}
            description={t("actions.issueClaim.description", {
              identity: identity.account.contractName || targetAddress,
            })}
            submitLabel={t("actions.issueClaim.submit")}
            isSubmitting={isPending}
            hasValuesStep
            disabled={({ isDirty }) => !isDirty || !canProceed || isPending}
            canContinue={() => canProceed}
            onSubmit={async (verification) => {
              if (!claimPayload) {
                return;
              }

              await issueClaim({
                targetIdentityAddress: targetAddress,
                claim: claimPayload,
                walletVerification: verification,
              });
            }}
            store={sheetStoreRef.current}
            showAssetDetailsOnConfirm={false}
          >
            <IssueClaimFormView
              form={form as ReturnType<typeof useAppForm>}
              topics={topics ?? []}
              values={typedValues}
              userCanIssueTopic={userCanIssueTopic}
              onTopicChange={(topic: string) => {
                const topicData = topics?.find((t) => t.name === topic);
                form.reset(createInitialValues(topic, topicData?.signature));
              }}
              toDateTimeValue={toDateTimeInputValue}
              fromDateTimeValue={fromDateTimeInput}
            />

            <ConfirmIssueClaimView
              targetIdentity={targetAddress}
              topic={selectedTopic}
              claim={claimPayload}
            />
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
