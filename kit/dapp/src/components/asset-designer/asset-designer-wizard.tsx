import { AssetTypeSelectionStep } from "@/components/asset-designer/asset-type-selection-step";
import { MultiStepWizard } from "@/components/multistep-form/multistep-wizard";
import type {
  FieldDefinition,
  StepDefinition,
} from "@/components/multistep-form/types";
import { decimals } from "@/lib/zod/validators/decimals";
import { isin } from "@/lib/zod/validators/isin";
import { orpc } from "@/orpc";
import { TokenBaseSchema } from "@/orpc/helpers/token/token.base-create.schema";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { z } from "zod/v4";

type AssetDesignerFormData = z.infer<typeof TokenBaseSchema>;
function AssetDesignerWizardComponent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { t } = useTranslation("asset-designer");

  // Define the steps for the wizard
  const steps = useMemo<StepDefinition<AssetDesignerFormData>[]>(
    () => [
      {
        id: "asset-type-selection",
        title: t("wizard.steps.asset-type.title"),
        description: t("wizard.steps.asset-type.description"),
        component: AssetTypeSelectionStep,
        validate: (data) => {
          if (!data.type) {
            return "Please select an asset type";
          }
          return undefined;
        },
      },
      {
        id: "token-details",
        title: t("wizard.steps.token-details.title"),
        description: t("wizard.steps.token-details.description"),
        fields: [
          {
            name: "name",
            label: t("form.fields.name.label"),
            type: "text",
            required: true,
            placeholder: t("form.fields.name.placeholder", { type: "token" }),
            description: t("form.fields.name.description"),
            schema: TokenBaseSchema.shape.name,
          },
          {
            name: "symbol",
            label: t("form.fields.symbol.label"),
            type: "text",
            required: true,
            placeholder: t("form.fields.symbol.placeholder"),
            description: t("form.fields.symbol.description"),
            schema: TokenBaseSchema.shape.symbol,
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
        ] as FieldDefinition<AssetDesignerFormData>[],
        validate: (data) => {
          // Additional validation can be added here
          const result = TokenBaseSchema.safeParse(data);
          if (!result.success) {
            return result.error.issues[0]?.message ?? "Validation failed";
          }
          return undefined;
        },
        mutation: {
          mutationKey: "create-token",
          mutationFn: async (data: Partial<AssetDesignerFormData>) => {
            const tokenType = data.type;
            if (!tokenType) {
              throw new Error("Asset type is required");
            }
            const commonData = {
              type: tokenType,
              name: data.name ?? "",
              symbol: data.symbol ?? "",
              decimals: data.decimals ?? 0,
              isin: data.isin,
              verification: data.verification ?? {
                verificationCode: "111111",
                verificationType: "pincode",
              },
              initialModulePairs: [],
              requiredClaimTopics: [],
              // messages: {
              // TODO: Add messages
              // },
            };

            if (tokenType === "bond") {
              return orpc.token.create.call({
                ...commonData,
                type: "bond",
                cap: "1000000",
                maturityDate: new Date().getTime().toString(),
                underlyingAsset: "ETH",
                faceValue: "1000000",
              });
            }

            if (tokenType === "fund") {
              return orpc.token.create.call({
                ...commonData,
                type: "fund",
                managementFeeBps: 100,
              });
            }

            // if (tokenType === "equity") {
            //   return orpc.token.create.call({
            //     ...commonData,
            //     type: "equity",
            //   });
            // }

            // if (tokenType === "stablecoin") {
            //   return orpc.token.create.call({
            //     ...commonData,
            //     type: "stablecoin",
            //   });
            // }

            return orpc.token.create.call({
              ...commonData,
              type: "deposit",
            });
          },
        },
      },
    ],
    [t]
  );

  const handleComplete = useCallback(
    (data: AssetDesignerFormData) => {
      // The mutation is handled by the step, so this is called after successful completion
      toast.success(t("messages.created", { type: data.type }));
      onSuccess?.();
    },
    [onSuccess, t]
  );

  // Default values for the form
  const defaultValues: Partial<AssetDesignerFormData> = {
    decimals: 18,
    verification: {
      verificationCode: "111111",
      verificationType: "pincode",
    },
  };

  return (
    <MultiStepWizard<AssetDesignerFormData>
      name="asset-designer"
      description={t("wizard.description")}
      steps={steps}
      onComplete={handleComplete}
      enableUrlPersistence={false} // Don't persist form data in URL for token creation
      showProgressBar={true}
      allowStepSkipping={false}
      defaultValues={defaultValues}
      className="h-full"
    />
  );
}

export const AssetDesignerWizard = AssetDesignerWizardComponent;
