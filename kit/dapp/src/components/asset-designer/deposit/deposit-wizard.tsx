import { MultiStepWizard } from "@/components/multistep-form/multistep-wizard";
import type {
  FieldDefinition,
  StepDefinition,
} from "@/components/multistep-form/types";
import { withWizardErrorBoundary } from "@/components/multistep-form/wizard-error-boundary";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { decimals } from "@/lib/zod/validators/decimals";
import { isin } from "@/lib/zod/validators/isin";
import { orpc } from "@/orpc";
import { DepositTokenSchema } from "@/orpc/helpers/token/create-handlers/deposit.create.schema";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/token.create.schema";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod/v4";

// Extract individual field schemas to avoid duplication
const nameSchema = z.string().min(1, "Name is required").max(50);
const symbolSchema = z.string().min(1, "Symbol is required").max(10);

function DepositWizardComponent({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useTranslation("asset-designer");

  // Define fields using existing validators
  const fields = useMemo<FieldDefinition<TokenCreateInput>[]>(
    () => [
      {
        name: "name",
        label: t("form.fields.name.label"),
        type: "text",
        required: true,
        placeholder: t("form.fields.name.placeholder", {
          type: AssetTypeEnum.deposit,
        }),
        description: t("form.fields.name.description"),
        schema: nameSchema,
      },
      {
        name: "symbol",
        label: t("form.fields.symbol.label"),
        type: "text",
        required: true,
        placeholder: t("form.fields.symbol.placeholder"),
        description: t("form.fields.symbol.description"),
        schema: symbolSchema,
      },
      {
        name: "decimals",
        label: t("form.fields.decimals.label"),
        type: "number",
        required: true,
        placeholder: t("form.fields.decimals.placeholder"),
        description: t("form.fields.decimals.description"),
        schema: decimals(),
      },
      {
        name: "isin",
        label: t("form.fields.isin.label"),
        type: "text",
        required: false,
        placeholder: t("form.fields.isin.placeholder"),
        description: t("form.fields.isin.description"),
        schema: isin().optional(),
      },
    ],
    [t]
  );

  // Define the single step for deposit creation
  const steps = useMemo<StepDefinition<TokenCreateInput>[]>(
    () => [
      {
        id: "deposit-details",
        title: t("form.title", { type: AssetTypeEnum.deposit }),
        description: t("form.description", { type: AssetTypeEnum.deposit }),
        fields,
        validate: (data) => {
          // Use the backend schema for complete validation
          const result = DepositTokenSchema.safeParse(data);
          if (!result.success) {
            return result.error.issues[0]?.message ?? "Validation failed";
          }
          return undefined;
        },
        mutation: {
          mutationKey: "create-deposit-token",
          mutationFn: async (data: Partial<TokenCreateInput>) => {
            const completeData = {
              type: AssetTypeEnum.deposit,
              name: data.name ?? "",
              symbol: data.symbol ?? "",
              decimals: data.decimals ?? 0,
              isin: data.isin,
              verification: data.verification ?? {
                verificationCode: "111111",
                verificationType: "pincode",
              },
              messages: {
                initialLoading: t("streaming-messages.initial-loading", {
                  type: AssetTypeEnum.deposit,
                }),
                noResultError: t("streaming-messages.no-result-error", {
                  type: AssetTypeEnum.deposit,
                }),
                defaultError: t("streaming-messages.default-error", {
                  type: AssetTypeEnum.deposit,
                }),
                creatingToken: t("messages.creating", {
                  type: AssetTypeEnum.deposit,
                }),
                tokenCreated: t("messages.created", {
                  type: AssetTypeEnum.deposit,
                }),
                tokenCreationFailed: t("messages.creation-failed", {
                  type: AssetTypeEnum.deposit,
                }),
              },
            };

            // Return the ORPC mutation which is already an async generator
            return orpc.token.create.call(completeData);
          },
        },
      },
    ],
    [fields, t]
  );

  const handleComplete = useCallback(() => {
    // The mutation is handled by the step, so this is called after successful completion
    toast.success(t("messages.created", { type: AssetTypeEnum.deposit }));
    onSuccess?.();
  }, [onSuccess, t]);

  // Default values for the form
  const defaultValues: Partial<TokenCreateInput> = {
    type: AssetTypeEnum.deposit,
    decimals: 2,
    verification: {
      verificationCode: "111111",
      verificationType: "pincode",
    },
    // TODO: Add messages
  };

  return (
    <MultiStepWizard<TokenCreateInput>
      name="deposit-token-creation"
      description={t("form.description", { type: AssetTypeEnum.deposit })}
      steps={steps}
      onComplete={handleComplete}
      enableUrlPersistence={false} // Don't persist form data in URL for token creation
      showProgressBar={false} // Hide progress bar for single step
      allowStepSkipping={false}
      defaultValues={defaultValues}
      className="h-full"
    />
  );
}

export const DepositWizard = withWizardErrorBoundary(DepositWizardComponent);
