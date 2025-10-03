/**
 * @fileoverview Issue Claim Sheet Component
 *
 * This component implements dynamic form generation and validation for issuing claims
 * to managed identities. It demonstrates the complete flow from topic selection to
 * claim issuance using the claim-schema-builder utility.
 *
 * ## Form Generation Flow
 *
 * 1. **Topic Selection**: User selects a claim topic from available options
 * 2. **Schema Resolution**: System determines appropriate Zod schema via getSchemaForClaim()
 * 3. **Field Generation**: Schema is converted to form fields using generateFormFields()
 * 4. **Form Rendering**: Dynamic form is rendered based on field configurations
 * 5. **Value Transformation**: Form values are processed and validated
 * 6. **Claim Construction**: Final claim data is built using buildClaimData()
 * 7. **Submission**: Claim is issued to the target identity
 *
 * ## Key Integration Points
 *
 * - `getSchemaForClaim()`: Resolves the correct validation schema
 * - `generateFormFields()`: Creates form field configurations
 * - `buildClaimData()`: Validates and formats claim data for submission
 *
 * @see {@link /kit/dapp/src/lib/utils/claims/claim-schema-builder.ts}
 */

import { useAppForm } from "@/hooks/use-app-form";
import {
  buildClaimData,
  generateFormFields,
  getSchemaForClaim,
} from "@/lib/utils/claims/claim-schema-builder";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useStore } from "@tanstack/react-form";
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
    topic: z.string(),
  })
  .catchall(z.unknown());

export type IssueClaimFormData = z.infer<typeof IssueClaimFormSchema>;

export type IssueClaimTopic = IssueClaimFormData["topic"];

type ClaimFormFields = ReturnType<typeof generateFormFields>;

/**
 * Creates initial form values dynamically based on the selected topic
 *
 * This function demonstrates the schema resolution process:
 * 1. Gets the appropriate schema using getSchemaForClaim()
 * 2. Generates form fields using generateFormFields()
 * 3. Creates default values based on field types
 *
 * This ensures the form is properly initialized when a topic changes.
 */
const createInitialValues = (
  topic?: string,
  signature?: string
): Record<string, unknown> => {
  const initialValues: Record<string, unknown> = {
    topic: topic || "",
  };

  if (topic) {
    // Step 1: Resolve schema for the topic (predefined or custom signature)
    const schema = getSchemaForClaim(topic, signature);
    if (schema) {
      // Step 2: Generate form field configurations from the schema
      const fields = generateFormFields(schema);

      // Step 3: Create appropriate default values based on field types
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
  }

  return initialValues;
};

const fromDateTimeInput = (value: string): string => {
  if (!value) return "";
  // Treat the datetime-local string as UTC to ensure consistency across timezones
  const ms = new Date(`${value}Z`).getTime();
  if (Number.isNaN(ms)) return "";
  return String(Math.floor(ms / 1000));
};

const toDateTimeInputValue = (timestamp: string | undefined): string => {
  if (!timestamp) return "";
  const seconds = Number.parseInt(timestamp, 10);
  if (Number.isNaN(seconds)) return "";
  const date = new Date(seconds * 1000);
  // Use UTC methods to format the date string for the datetime-local input
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
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
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
          return undefined;
        }
        const numValue = Number(trimmedValue);
        if (Number.isNaN(numValue) || !Number.isFinite(numValue)) {
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
 *
 * This function demonstrates the complete validation and transformation flow:
 * 1. Resolves form fields from schema if not provided
 * 2. Transforms form values based on field types (datetime, numbers, etc.)
 * 3. Uses buildClaimData() to validate and format the final claim
 *
 * The transformation step is crucial for handling datetime inputs (converted to timestamps)
 * and ensuring proper data types for blockchain submission.
 */
const buildClaimPayload = (
  values: Record<string, unknown>,
  topic: string,
  signature?: string,
  fields?: ClaimFormFields
): ClaimData | null => {
  if (!topic) {
    return null;
  }

  try {
    // Step 1: Resolve form fields if not provided (lazy evaluation)
    const resolvedFields =
      fields ??
      (() => {
        const schema = getSchemaForClaim(topic, signature);
        return schema ? generateFormFields(schema) : null;
      })();

    if (!resolvedFields) {
      return null;
    }

    const transformedValues: Record<string, unknown> = {};

    // Step 2: Transform field values based on their types (datetime → timestamp, etc.)
    for (const field of resolvedFields) {
      const rawValue = values[field.name];
      const transformedValue = transformFieldValue(rawValue, field.type);

      if (transformedValue !== undefined) {
        transformedValues[field.name] = transformedValue;
      }
    }

    // Step 3: Use the schema-driven buildClaimData function for validation and formatting
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

        await router.invalidate();
      },
    })
  );

  const form = useAppForm({
    defaultValues: createInitialValues(),
  });

  const formValues = useStore(form.store, (state) => state.values);

  const typedValues = useMemo(
    () => IssueClaimFormSchema.parse(formValues),
    [formValues]
  );

  const selectedTopic: IssueClaimTopic = typedValues.topic;

  const selectedTopicData = useMemo(
    () => topics?.find((topic) => topic.name === selectedTopic),
    [topics, selectedTopic]
  );

  // Dynamic form field generation based on selected topic
  // This demonstrates the real-time schema resolution and field generation
  const formFields = useMemo<ClaimFormFields>(() => {
    if (!selectedTopic || !selectedTopicData) return [];

    // Resolve schema: predefined schemas take precedence over custom signatures
    const schema = getSchemaForClaim(
      selectedTopic,
      selectedTopicData.signature
    );

    // Generate form field configurations from the schema
    return schema ? generateFormFields(schema) : [];
  }, [selectedTopic, selectedTopicData]);

  // Real-time claim payload validation and construction
  // This updates whenever form values change, providing immediate feedback
  const claimPayload = useMemo(
    () =>
      buildClaimPayload(
        formValues,
        selectedTopic,
        selectedTopicData?.signature,
        formFields
      ),
    [formValues, selectedTopic, selectedTopicData?.signature, formFields]
  );

  const userCanIssueTopic = useMemo(
    () =>
      Boolean(
        selectedTopic &&
          trustedIssuers?.some((issuer) =>
            issuer.claimTopics.some((topic) => topic.name === selectedTopic)
          )
      ),
    [selectedTopic, trustedIssuers]
  );

  const canProceed = Boolean(claimPayload) && userCanIssueTopic;

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

  const handleSubmit = (verification: UserVerification) => {
    if (!claimPayload) {
      return;
    }
    const promise = issueClaim({
      targetIdentityAddress: targetAddress,
      claim: claimPayload,
      walletVerification: verification,
    });

    toast.promise(promise, {
      loading: t("actions.issueClaim.submitting"),
      success: t("actions.issueClaim.success"),
      error: (error: Error) =>
        t("actions.issueClaim.error", { error: error.message }),
    });
    handleClose();
  };

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
      disabled={() => !canProceed || isPending}
      canContinue={() => canProceed}
      onSubmit={handleSubmit}
      store={sheetStoreRef.current}
      showAssetDetailsOnConfirm={false}
      confirm={
        <ConfirmIssueClaimView
          topic={selectedTopic}
          claim={claimPayload}
          formFields={formFields}
          signature={selectedTopicData?.signature}
        />
      }
    >
      <IssueClaimFormView
        form={form as ReturnType<typeof useAppForm>}
        topics={topics ?? []}
        values={typedValues}
        formFields={formFields}
        userCanIssueTopic={userCanIssueTopic}
        onTopicChange={(topic: string) => {
          // When topic changes, only update the dynamic fields, not the entire form
          // This prevents race conditions and maintains the selected topic
          const topicData = topics?.find((t) => t.name === topic);

          // First, update the topic field value
          form.setFieldValue("topic", topic);

          // Then clear/reset only the dynamic fields for the new topic
          if (topicData) {
            const schema = getSchemaForClaim(topic, topicData.signature);
            if (schema) {
              const fields = generateFormFields(schema);

              // Reset each dynamic field to its default value
              fields.forEach((field) => {
                let defaultValue: unknown;
                switch (field.type) {
                  case "boolean":
                  case "checkbox":
                    defaultValue = false;
                    break;
                  case "number":
                  case "bigint":
                    defaultValue = "";
                    break;
                  default:
                    defaultValue = "";
                }
                form.setFieldValue(field.name, defaultValue);
              });
            }
          }
        }}
        toDateTimeValue={toDateTimeInputValue}
        fromDateTimeValue={fromDateTimeInput}
      />
    </ActionFormSheet>
  );
}
