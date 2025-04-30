"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AssetType } from "../asset-designer-dialog";

interface AssetTypeCardProps {
  _type: AssetType;
  title: string;
  description: string;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}

function AssetTypeCard({
  _type,
  title,
  description,
  features,
  isSelected,
  onSelect,
}: AssetTypeCardProps) {
  return (
    <div
      className={cn(
        "border rounded-lg p-6 cursor-pointer transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "hover:border-muted-foreground hover:bg-muted/5"
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div
          className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground"
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      <h4 className="text-sm font-medium mb-2">Key features:</h4>
      <ul className="space-y-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm">
            <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <ChevronRight className="h-3 w-3" />
            </div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface AssetTypeSelectionProps {
  selectedType: AssetType;
  onSelect: (type: AssetType) => void;
}

export function AssetTypeSelection({
  selectedType,
  onSelect,
}: AssetTypeSelectionProps) {
  const _t = useTranslations("admin.sidebar.asset-types");

  const assetTypes = [
    {
      type: "bond" as const,
      title: "Bond",
      description: "Create a tokenized debt instrument",
      features: [
        "Fixed interest payments",
        "Maturity date management",
        "Transferable ownership",
        "Principal repayment",
      ],
    },
    {
      type: "cryptocurrency" as const,
      title: "Cryptocurrency",
      description: "Create a native cryptocurrency token",
      features: [
        "Secure transactions",
        "Decentralized ownership",
        "Global payments",
        "Programmable money",
      ],
    },
    {
      type: "equity" as const,
      title: "Equity",
      description: "Create a tokenized share or stock",
      features: [
        "Voting rights",
        "Dividend distribution",
        "Fractional ownership",
        "Liquidity",
      ],
    },
    {
      type: "fund" as const,
      title: "Fund",
      description: "Create a tokenized investment fund",
      features: [
        "Portfolio diversification",
        "Performance tracking",
        "Redemption rights",
        "Lower investment barriers",
      ],
    },
    {
      type: "stablecoin" as const,
      title: "Stablecoin",
      description: "Create a price-stable digital currency",
      features: [
        "Price stability",
        "Collateral backing",
        "Transparent reserves",
        "Fast settlements",
      ],
    },
    {
      type: "deposit" as const,
      title: "Deposit",
      description: "Create a tokenized deposit certificate",
      features: [
        "Interest earning",
        "Redeemable",
        "Term options",
        "Institutional backing",
      ],
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Select asset type</h2>
      <p className="text-muted-foreground mb-8">
        Choose the type of digital asset you want to create
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {assetTypes.map((assetType) => (
          <AssetTypeCard
            key={assetType.type}
            _type={assetType.type}
            title={assetType.title}
            description={assetType.description}
            features={assetType.features}
            isSelected={selectedType === assetType.type}
            onSelect={() => onSelect(assetType.type)}
          />
        ))}
      </div>
    </div>
  );
}
