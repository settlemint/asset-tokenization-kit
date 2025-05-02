"use client";

import { AssetTypeIcon } from "@/components/blocks/asset-type-icon/asset-type-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info } from "lucide-react";
import { useTranslations } from "next-intl";
<<<<<<< HEAD
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
=======
import type { AssetType } from "../types";
>>>>>>> d02f46f1 (feat: new asset design UI iteration 2 (#1744))

interface AssetTypeSelectionProps {
  selectedType: AssetType | null;
  onSelect: (type: AssetType) => void;
}

interface AssetTypeInfo {
  type: AssetType;
  descriptionKey: string;
  featureKeys: string[];
}

const assetTypesInfo: AssetTypeInfo[] = [
  {
    type: "bond",
    descriptionKey: "private.assets.create.form.description.bonds",
    featureKeys: [
      "asset-designer.type-selection.features.bond.fixed-interest",
      "asset-designer.type-selection.features.bond.maturity-management",
      "asset-designer.type-selection.features.bond.transferable-ownership",
      "asset-designer.type-selection.features.bond.principal-repayment",
    ],
  },
  {
    type: "cryptocurrency",
    descriptionKey: "private.assets.create.form.description.cryptocurrencies",
    featureKeys: [
      "asset-designer.type-selection.features.cryptocurrency.secure-transactions",
      "asset-designer.type-selection.features.cryptocurrency.decentralized-ownership",
      "asset-designer.type-selection.features.cryptocurrency.global-payments",
      "asset-designer.type-selection.features.cryptocurrency.programmable-money",
    ],
  },
  {
    type: "equity",
    descriptionKey: "private.assets.create.form.description.equities",
    featureKeys: [
      "asset-designer.type-selection.features.equity.voting-rights",
      "asset-designer.type-selection.features.equity.dividend-distribution",
      "asset-designer.type-selection.features.equity.fractional-ownership",
      "asset-designer.type-selection.features.equity.liquidity",
    ],
  },
  {
    type: "fund",
    descriptionKey: "private.assets.create.form.description.funds",
    featureKeys: [
      "asset-designer.type-selection.features.fund.portfolio-diversification",
      "asset-designer.type-selection.features.fund.performance-tracking",
      "asset-designer.type-selection.features.fund.redemption-rights",
      "asset-designer.type-selection.features.fund.lower-investment",
    ],
  },
  {
    type: "stablecoin",
    descriptionKey: "private.assets.create.form.description.stablecoins",
    featureKeys: [
      "asset-designer.type-selection.features.stablecoin.price-stability",
      "asset-designer.type-selection.features.stablecoin.collateral-backing",
      "asset-designer.type-selection.features.stablecoin.transparent-reserves",
      "asset-designer.type-selection.features.stablecoin.fast-settlements",
    ],
  },
  {
    type: "deposit",
    descriptionKey: "private.assets.create.form.description.deposits",
    featureKeys: [
      "asset-designer.type-selection.features.deposit.interest-earning",
      "asset-designer.type-selection.features.deposit.redeemable",
      "asset-designer.type-selection.features.deposit.term-options",
      "asset-designer.type-selection.features.deposit.institutional-backing",
    ],
  },
];

export function AssetTypeSelection({
  selectedType,
  onSelect,
}: AssetTypeSelectionProps) {
<<<<<<< HEAD
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
=======
  const t = useTranslations();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {t("asset-designer.type-selection.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("asset-designer.type-selection.description")}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assetTypesInfo.map((assetInfo) => (
            <Card
              key={assetInfo.type}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md hover:bg-accent focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              )}
              style={
                selectedType === assetInfo.type
                  ? {
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: "var(--sm-accent)",
                    }
                  : {
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: "transparent",
                    }
              }
              onClick={() => assetInfo.type && onSelect(assetInfo.type)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-0">
                <div className="flex items-center space-x-3">
                  {assetInfo.type && (
                    <AssetTypeIcon type={assetInfo.type} size="md" />
                  )}
                  <CardTitle className="text-base font-medium capitalize">
                    {assetInfo.type
                      ? t(
                          assetInfo.type === "cryptocurrency"
                            ? "asset-type.cryptocurrencies"
                            : assetInfo.type === "equity"
                              ? "asset-type.equities"
                              : (`asset-type.${assetInfo.type}s` as any)
                        )
                      : ""}
                  </CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>More information about {assetInfo.type}.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  {t(assetInfo.descriptionKey as any)}
                </p>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-foreground">
                    {t("asset-designer.type-selection.key-features")}
                  </h4>
                  <ul className="space-y-1.5">
                    {assetInfo.featureKeys.map((featureKey) => (
                      <li
                        key={featureKey}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {t(featureKey as any)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
>>>>>>> d02f46f1 (feat: new asset design UI iteration 2 (#1744))
      </div>
    </div>
  );
}
