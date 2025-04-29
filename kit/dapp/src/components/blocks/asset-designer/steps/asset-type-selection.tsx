"use client";

import { AssetTypeIcon } from "@/components/blocks/asset-type-icon/asset-type-icon";
import { cn } from "@/lib/utils";
import type { AssetType } from "../types";
import { assetTypeDescriptions } from "../types";

interface AssetTypeSelectionProps {
  selectedType: AssetType;
  onSelect: (type: AssetType) => void;
}

export function AssetTypeSelection({
  selectedType,
  onSelect,
}: AssetTypeSelectionProps) {
  const assetTypes = Object.keys(
    assetTypeDescriptions
  ) as NonNullable<AssetType>[];

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-medium mb-2">Choose Asset Type</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Select the type of digital asset you want to create. Each asset type has
        different properties and requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {assetTypes.map((type) => (
          <button
            key={type}
            className={cn(
              "flex flex-col items-center p-6 border rounded-xl transition-all",
              selectedType === type
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-accent hover:text-accent-foreground border-border"
            )}
            onClick={() => onSelect(type)}
          >
            <div className="mb-4">
              <AssetTypeIcon type={type} size="md" />
            </div>
            <h3 className="font-medium text-lg capitalize mb-2">{type}</h3>
            <p
              className={cn(
                "text-sm text-center",
                selectedType === type
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}
            >
              {assetTypeDescriptions[type]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
