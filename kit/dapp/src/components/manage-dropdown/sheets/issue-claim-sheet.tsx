import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import {
  ClaimDataSchema,
  IssueableClaimTopicSchema,
} from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
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

const IssueClaimFormSchema = z.object({
  topic: IssueableClaimTopicSchema.or(z.literal("")),
  claimValue: z.string().optional(),
  collateralAmount: z.string().optional(),
  collateralExpiryTimestamp: z.string().optional(),
  assetClass: z.string().optional(),
  assetCategory: z.string().optional(),
  issuerAddress: z.string().optional(),
  basePriceAmount: z.string().optional(),
  basePriceCurrencyCode: z.string().optional(),
  basePriceDecimals: z.string().optional(),
  contractAddress: z.string().optional(),
  isin: z.string().optional(),
  issuerJurisdiction: z.string().optional(),
  licenseType: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseJurisdiction: z.string().optional(),
  licenseValidUntil: z.string().optional(),
  exemptionReference: z.string().optional(),
  prospectusReference: z.string().optional(),
  reportingCompliant: z.boolean().optional(),
  reportingLastUpdated: z.string().optional(),
});

export type IssueClaimFormData = z.infer<typeof IssueClaimFormSchema>;

export type IssueClaimTopic = IssueClaimFormData["topic"];

const TEXT_CLAIM_TOPICS = new Set<IssueClaimTopic>([
  "knowYourCustomer",
  "antiMoneyLaundering",
  "qualifiedInstitutionalInvestor",
  "professionalInvestor",
  "accreditedInvestor",
  "accreditedInvestorVerified",
  "regulationS",
]);

const createInitialValues = (): IssueClaimFormData => ({
  topic: "",
  claimValue: "",
  collateralAmount: "",
  collateralExpiryTimestamp: "",
  assetClass: "",
  assetCategory: "",
  issuerAddress: "",
  basePriceAmount: "",
  basePriceCurrencyCode: "",
  basePriceDecimals: "",
  contractAddress: "",
  isin: "",
  issuerJurisdiction: "",
  licenseType: "",
  licenseNumber: "",
  licenseJurisdiction: "",
  licenseValidUntil: "",
  exemptionReference: "",
  prospectusReference: "",
  reportingCompliant: true,
  reportingLastUpdated: "",
});

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const fromDateTimeInput = (value: string) => {
  if (!value) return "";
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) return "";
  return String(Math.floor(ms / 1000));
};

const toDateTimeInputValue = (timestamp: string | undefined) => {
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

const buildClaimPayload = (values: IssueClaimFormData): ClaimData | null => {
  const topic = values.topic;
  if (!topic) {
    return null;
  }

  if (TEXT_CLAIM_TOPICS.has(topic)) {
    const claim = values.claimValue?.trim();
    if (!claim) return null;
    return ClaimDataSchema.parse({
      topic,
      data: { claim },
    });
  }

  switch (topic) {
    case "collateral": {
      const amount = values.collateralAmount?.trim();
      if (!amount) return null;
      const expiryTimestamp =
        values.collateralExpiryTimestamp?.trim() ||
        String(nowInSeconds() + 86_400 * 365);
      return ClaimDataSchema.parse({
        topic: "collateral",
        data: {
          amount,
          expiryTimestamp,
        },
      });
    }
    case "assetClassification": {
      const assetClass = values.assetClass?.trim();
      const category = values.assetCategory?.trim();
      if (!assetClass || !category) return null;
      return ClaimDataSchema.parse({
        topic: "assetClassification",
        data: {
          class: assetClass,
          category,
        },
      });
    }
    case "assetIssuer": {
      const issuerAddress = values.issuerAddress?.trim();
      if (!issuerAddress) return null;
      return ClaimDataSchema.parse({
        topic: "assetIssuer",
        data: {
          issuerAddress,
        },
      });
    }
    case "basePrice": {
      const amount = values.basePriceAmount?.trim();
      if (!amount) return null;
      const currencyCode = values.basePriceCurrencyCode?.trim() || "USD";
      const decimals = Number.parseInt(values.basePriceDecimals ?? "2", 10);
      const boundedDecimals = Number.isNaN(decimals)
        ? 2
        : Math.min(Math.max(decimals, 0), 18);
      return ClaimDataSchema.parse({
        topic: "basePrice",
        data: {
          amount,
          currencyCode,
          decimals: boundedDecimals,
        },
      });
    }
    case "contractIdentity": {
      const contractAddress = values.contractAddress?.trim();
      if (!contractAddress) return null;
      return ClaimDataSchema.parse({
        topic: "contractIdentity",
        data: {
          contractAddress,
        },
      });
    }
    case "isin": {
      const isin = values.isin?.trim();
      if (!isin) return null;
      return ClaimDataSchema.parse({
        topic: "isin",
        data: {
          isin,
        },
      });
    }
    case "issuerJurisdiction": {
      const jurisdiction = values.issuerJurisdiction?.trim();
      if (!jurisdiction) return null;
      return ClaimDataSchema.parse({
        topic: "issuerJurisdiction",
        data: {
          jurisdiction,
        },
      });
    }
    case "issuerLicensed": {
      const licenseType = values.licenseType?.trim();
      const licenseNumber = values.licenseNumber?.trim();
      const jurisdiction = values.licenseJurisdiction?.trim();
      if (!licenseType || !licenseNumber || !jurisdiction) return null;
      const validUntil =
        values.licenseValidUntil?.trim() ||
        String(nowInSeconds() + 86_400 * 365);
      return ClaimDataSchema.parse({
        topic: "issuerLicensed",
        data: {
          licenseType,
          licenseNumber,
          jurisdiction,
          validUntil,
        },
      });
    }
    case "issuerProspectusExempt": {
      const exemptionReference = values.exemptionReference?.trim();
      if (!exemptionReference) return null;
      return ClaimDataSchema.parse({
        topic: "issuerProspectusExempt",
        data: {
          exemptionReference,
        },
      });
    }
    case "issuerProspectusFiled": {
      const prospectusReference = values.prospectusReference?.trim();
      if (!prospectusReference) return null;
      return ClaimDataSchema.parse({
        topic: "issuerProspectusFiled",
        data: {
          prospectusReference,
        },
      });
    }
    case "issuerReportingCompliant": {
      const compliant = values.reportingCompliant ?? true;
      const lastUpdated =
        values.reportingLastUpdated?.trim() || String(nowInSeconds());
      return ClaimDataSchema.parse({
        topic: "issuerReportingCompliant",
        data: {
          compliant,
          lastUpdated,
        },
      });
    }
    default:
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
        const selectedTopic = typedValues.topic;
        const claimPayload = buildClaimPayload(typedValues);
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
              onTopicChange={(topic) => {
                form.reset({
                  ...createInitialValues(),
                  topic,
                });
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
