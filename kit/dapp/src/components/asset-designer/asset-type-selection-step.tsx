import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAssetTypeFromFactoryTypeId,
  type AssetFactoryTypeId,
  type AssetType,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc";
import type { TokenBaseSchema } from "@/orpc/helpers/token/token.base-create.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery } from "@tanstack/react-query";
import {
  BanknoteIcon,
  Building2Icon,
  ChartBarIcon,
  DollarSignIcon,
  EuroIcon,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod/v4";

const logger = createLogger();

// Map asset types to icons
const assetIcons: Record<
  AssetType,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  bond: BanknoteIcon,
  equity: Building2Icon,
  fund: ChartBarIcon,
  stablecoin: DollarSignIcon,
  deposit: EuroIcon,
};

interface AssetTypeSelectionStepProps {
  form: UseFormReturn<z.infer<typeof TokenBaseSchema>>;
  onNext: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function AssetTypeSelectionStep({
  form,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: AssetTypeSelectionStepProps) {
  const { t } = useTranslation(["asset-types", "common"]);

  // Get system address from settings
  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({
      input: { key: "SYSTEM_ADDRESS" },
    })
  );

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

  const selectedAssetType = form.watch("type");

  const handleAssetTypeChange = useCallback(
    (value: string) => {
      form.setValue("type", value as AssetType);
    },
    [form]
  );

  const handleNext = useCallback(() => {
    if (!selectedAssetType) {
      form.setError("type", {
        type: "required",
        message: "Please select an asset type",
      });
      return;
    }
    form.clearErrors("type");
    onNext();
  }, [selectedAssetType, form, onNext]);

  if (isLoadingSystem) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Select Asset Type</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Loading available asset types...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (availableAssetTypes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">No Asset Types Available</h3>
          <p className="text-sm text-muted-foreground mt-2">
            No token factories have been deployed yet. Please deploy token
            factories first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Select Asset Type</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Choose the type of asset you want to create. Only asset types with
          deployed factories are shown.
        </p>
      </div>

      <RadioGroup
        value={selectedAssetType}
        onValueChange={handleAssetTypeChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {availableAssetTypes.map((assetType) => {
          const Icon = assetIcons[assetType];
          return (
            <Card
              key={assetType}
              className={`cursor-pointer transition-all ${
                selectedAssetType === assetType
                  ? "ring-2 ring-primary"
                  : "hover:border-primary/50"
              }`}
            >
              <CardContent className="p-4">
                <Label
                  htmlFor={assetType}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <RadioGroupItem
                    value={assetType}
                    id={assetType}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        {t(`asset-types:${assetType}.name`)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(`asset-types:${assetType}.description`)}
                    </p>
                  </div>
                </Label>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>

      {form.formState.errors.type && (
        <p className="text-sm text-destructive">
          {form.formState.errors.type.message}
        </p>
      )}

      <div className="flex justify-between pt-4">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={onPrevious}>
            {t("common:previous")}
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          className={isFirstStep ? "ml-auto" : ""}
        >
          {isLastStep ? t("common:complete") : t("common:next")}
        </Button>
      </div>
    </div>
  );
}

AssetTypeSelectionStep.displayName = "AssetTypeSelectionStep";
