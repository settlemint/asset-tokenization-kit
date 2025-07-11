import { MultiStepWizard } from "@/components/multistep-form/multistep-wizard";
import type {
  FieldDefinition,
  StepDefinition,
} from "@/components/multistep-form/types";
import { useSettings } from "@/hooks/use-settings";
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
  getFactoryTypeIdFromAssetType,
  type AssetClass,
  type AssetFactoryTypeId,
  type AssetType,
} from "@/lib/zod/validators/asset-types";
import { decimals } from "@/lib/zod/validators/decimals";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { isin } from "@/lib/zod/validators/isin";
import { orpc } from "@/orpc";
import { BondTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/bond.create.schema";
import { FundTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/fund.create.schema";
import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery } from "@tanstack/react-query";
import { addDays, addYears } from "date-fns";
import { Building2, Coins, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { z } from "zod/v4";

const logger = createLogger();

// Helper function to get icon for asset type
const getAssetTypeIcon = (assetType: AssetType) => {
  switch (assetType) {
    case "bond":
      return <Building2 className="h-5 w-5" />;
    case "equity":
      return <TrendingUp className="h-5 w-5" />;
    case "fund":
      return <PiggyBank className="h-5 w-5" />;
    case "stablecoin":
      return <Coins className="h-5 w-5" />;
    case "deposit":
      return <Wallet className="h-5 w-5" />;
    default:
      return <Building2 className="h-5 w-5" />;
  }
};

// Helper function to get icon for asset class
const getAssetClassIcon = (assetClass: AssetClass) => {
  switch (assetClass) {
    case "fixedIncome":
      return <PiggyBank className="h-5 w-5" />;
    case "flexibleIncome":
      return <TrendingUp className="h-5 w-5" />;
    case "cashEquivalent":
      return <Coins className="h-5 w-5" />;
    default:
      return <Building2 className="h-5 w-5" />;
  }
};

// TODO: Better schema type
type AssetDesignerFormData = z.infer<typeof TokenBaseSchema> & {
  // Bond-specific fields
  cap?: string;
  faceValue?: string;
  maturityDate?: string;
  underlyingAsset?: string;
  // Fund-specific fields
  managementFeeBps?: number;
};
function AssetDesignerWizardComponent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { t } = useTranslation(["asset-designer", "asset-types", "navigation"]);
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");

  // Get system details including deployed token factories
  const { data: systemDetails, isLoading: isLoadingSystem } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: Boolean(systemAddress),
  });

  // Extract available asset types from deployed token factories
  const availableAssetTypes = useMemo(() => {
    if (!systemDetails?.tokenFactories) return [];

    const assetTypes = systemDetails.tokenFactories
      .map((factory) => {
        try {
          // Extract the factory type from the typeId
          const factoryTypeId = factory.typeId as AssetFactoryTypeId;
          return getAssetTypeFromFactoryTypeId(factoryTypeId);
        } catch {
          logger.warn("Unknown factory typeId", { typeId: factory.typeId });
          return null;
        }
      })
      .filter((type): type is AssetType => type !== null);

    // Remove duplicates and sort
    return [...new Set(assetTypes)].sort();
  }, [systemDetails]);

  // Organize asset types into asset class groups
  const assetClassGroups = useMemo(() => {
    if (availableAssetTypes.length === 0) return [];

    // Group asset types by their asset class
    const groupedByClass = availableAssetTypes.reduce(
      (acc, assetType) => {
        try {
          const factoryTypeId = getFactoryTypeIdFromAssetType(assetType);
          const assetClass = getAssetClassFromFactoryTypeId(factoryTypeId);

          if (!acc[assetClass]) {
            acc[assetClass] = [assetType];
          } else {
            acc[assetClass].push(assetType);
          }
        } catch (error) {
          logger.warn("Could not classify asset type", { assetType, error });
        }
        return acc;
      },
      {} as Partial<Record<AssetClass, AssetType[]>>
    ) as Record<AssetClass, AssetType[]>;

    // Convert to array of groups with proper translation keys
    return Object.entries(groupedByClass).map(([assetClass, assetTypes]) => ({
      assetClass: assetClass as AssetClass,
      assetTypes,
    }));
  }, [availableAssetTypes]);

  // Define the steps for the wizard
  const steps = useMemo<StepDefinition<AssetDesignerFormData>[]>(() => {
    const dynamicSteps: StepDefinition<AssetDesignerFormData>[] = [];

    // Step 1: Asset Type Selection
    if (assetClassGroups.length > 0) {
      dynamicSteps.push({
        id: "asset-type-selection",
        title: t("wizard.steps.asset-type.title"),
        description: t("wizard.steps.asset-type.description"),
        enableFilters: true,
        groups: assetClassGroups.map((group) => ({
          id: group.assetClass,
          label: t(`navigation:${group.assetClass}`),
          icon: getAssetClassIcon(group.assetClass),
          fields: [
            {
              name: "type",
              type: "radio",
              variant: "card",
              required: true,
              options: group.assetTypes.map((assetType) => ({
                label: t(`asset-types:${assetType}.name`),
                value: assetType,
                description: t(`asset-types:${assetType}.description`),
                icon: getAssetTypeIcon(assetType),
              })),
              schema: TokenBaseSchema.shape.type,
            },
          ] as FieldDefinition<AssetDesignerFormData>[],
        })),
        validate: (data) => {
          if (!data.type) {
            return "Please select an asset type";
          }
          return undefined;
        },
      });
    }

    // Step 2: Token Details
    dynamicSteps.push({
      id: "token-details",
      title: t("wizard.steps.token-details.title"),
      description: t("wizard.steps.token-details.description"),
      fields: (formData) => {
        const baseFields: FieldDefinition<AssetDesignerFormData>[] = [
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
        ];

        // Add asset-specific fields based on the selected type
        if (formData.type === "bond") {
          baseFields.push(
            {
              name: "cap",
              label: t("form.fields.cap.label"),
              type: "number", // TODO: create amount input type
              required: true,
              placeholder: t("form.fields.cap.placeholder"),
              description: t("form.fields.cap.description"),
              schema: BondTokenSchema.shape.cap,
            },
            {
              name: "faceValue",
              label: t("form.fields.faceValue.label"),
              type: "number", // TODO: create amount input type
              required: true,
              placeholder: t("form.fields.faceValue.placeholder"),
              description: t("form.fields.faceValue.description"),
              schema: BondTokenSchema.shape.faceValue,
            },
            {
              name: "maturityDate",
              label: t("form.fields.maturityDate.label"),
              type: "datetime",
              required: true,
              placeholder: t("form.fields.maturityDate.placeholder"),
              description: t("form.fields.maturityDate.description"),
              schema: BondTokenSchema.shape.maturityDate,
              minDate: addDays(new Date(), 1), // 1 day from now
              maxDate: addYears(new Date(), 100), // 100 years from now
            },
            {
              name: "underlyingAsset",
              label: t("form.fields.underlyingAsset.label"),
              type: "text", // TODO: create address input type
              required: true,
              placeholder: t("form.fields.underlyingAsset.placeholder"),
              description: t("form.fields.underlyingAsset.description"),
              schema: ethereumAddress,
            }
          );
        } else if (formData.type === "fund") {
          baseFields.push({
            name: "managementFeeBps",
            label: t("form.fields.managementFeeBps.label"),
            type: "number", // TODO: create percentage input type
            required: true,
            placeholder: t("form.fields.managementFeeBps.placeholder"),
            description: t("form.fields.managementFeeBps.description"),
            schema: FundTokenSchema.shape.managementFeeBps,
          });
        }

        return baseFields;
      },
      validate: (data) => {
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
          };

          if (tokenType === "bond") {
            return orpc.token.create.call({
              ...commonData,
              type: "bond",
              cap: data.cap ?? "1000000",
              maturityDate:
                data.maturityDate ?? new Date().getTime().toString(),
              underlyingAsset:
                data.underlyingAsset ??
                "0x0000000000000000000000000000000000000000",
              faceValue: data.faceValue ?? "1000000",
            });
          }

          if (tokenType === "fund") {
            return orpc.token.create.call({
              ...commonData,
              type: "fund",
              managementFeeBps: data.managementFeeBps ?? 100,
            });
          }

          return orpc.token.create.call({
            ...commonData,
            type: tokenType,
          });
        },
      },
    });

    return dynamicSteps;
  }, [t, assetClassGroups]);

  const handleComplete = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  // Default values for the form
  const defaultValues: Partial<AssetDesignerFormData> = {
    decimals: 18,
    verification: {
      verificationCode: "111111",
      verificationType: "pincode",
    },
  };

  // Show loading state while system details are being fetched
  if (isLoadingSystem) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">{t("messages.loading")}</div>
          <div className="text-sm text-muted-foreground">
            {t("messages.loading-description")}
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no asset types are available
  if (assetClassGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">
            {t("messages.no-asset-types")}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("messages.no-asset-types-description")}
          </div>
        </div>
      </div>
    );
  }

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
