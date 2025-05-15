"use client";

import { AssetTypeIcon } from "@/components/blocks/asset-type-icon/asset-type-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface AssetTypeSelectionProps {
  selectedType: AssetType | null;
  onSelect: (type: AssetType) => void;
}

interface AssetTypeInfo {
  type: AssetType;
  descriptionKey: string;
  extendedDescriptionKey: string;
  featureKeys: { status: boolean; label: string }[];
}

const assetTypesInfo: AssetTypeInfo[] = [
  {
    type: "bond",
    descriptionKey: "private.assets.table.topinfo-title.bond",
    extendedDescriptionKey: "private.assets.table.topinfo-description.bond",
    featureKeys: [
      {
        status: true,
        label: "asset-designer.type-selection.features.one",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.two",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.three",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.four",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.five",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.six",
      },
    ],
  },
  {
    type: "cryptocurrency",
    descriptionKey: "private.assets.table.topinfo-title.cryptocurrency",
    extendedDescriptionKey:
      "private.assets.table.topinfo-description.cryptocurrency",
    featureKeys: [
      {
        status: true,
        label: "asset-designer.type-selection.features.one",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.two",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.three",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.four",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.five",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.six",
      },
    ],
  },
  {
    type: "equity",
    descriptionKey: "private.assets.table.topinfo-title.equity",
    extendedDescriptionKey: "private.assets.table.topinfo-description.equity",
    featureKeys: [
      {
        status: true,
        label: "asset-designer.type-selection.features.one",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.two",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.three",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.four",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.five",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.six",
      },
    ],
  },
  {
    type: "fund",
    descriptionKey: "private.assets.table.topinfo-title.fund",
    extendedDescriptionKey: "private.assets.table.topinfo-description.fund",
    featureKeys: [
      {
        status: true,
        label: "asset-designer.type-selection.features.one",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.two",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.three",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.four",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.five",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.six",
      },
    ],
  },
  {
    type: "stablecoin",
    descriptionKey: "private.assets.table.topinfo-title.stablecoin",
    extendedDescriptionKey:
      "private.assets.table.topinfo-description.stablecoin",
    featureKeys: [
      {
        status: true,
        label: "asset-designer.type-selection.features.one",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.two",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.three",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.four",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.five",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.six",
      },
    ],
  },
  {
    type: "deposit",
    descriptionKey: "private.assets.table.topinfo-title.deposit",
    extendedDescriptionKey: "private.assets.table.topinfo-description.deposit",
    featureKeys: [
      {
        status: true,
        label: "asset-designer.type-selection.features.one",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.two",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.three",
      },
      {
        status: false,
        label: "asset-designer.type-selection.features.four",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.five",
      },
      {
        status: true,
        label: "asset-designer.type-selection.features.six",
      },
    ],
  },
];

export function AssetTypeSelection({
  selectedType,
  onSelect,
}: AssetTypeSelectionProps) {
  const t = useTranslations();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {t("asset-designer.type-selection.title")}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {t("asset-designer.type-selection.description")}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-4 px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {assetTypesInfo.map((assetInfo) => (
            <div key={assetInfo.type} className="pl-2">
              <Card
                className={cn(
                  "flex flex-col h-full cursor-pointer transition-all duration-200 overflow-hidden",
                  "border relative gap-2",
                  selectedType === assetInfo.type
                    ? "border-primary shadow-[0_2px_8px_rgba(0,0,0,0.05)] ring-1 ring-primary/20"
                    : "border-muted hover:border-primary/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                  selectedType === assetInfo.type
                    ? "after:absolute after:inset-0 after:bg-primary/5"
                    : "hover:after:absolute hover:after:inset-0 hover:after:bg-accent/5"
                )}
                onClick={() => assetInfo.type && onSelect(assetInfo.type)}
              >
                <CardHeader className="relative z-10">
                  <div className="flex flex-row items-center justify-between pb-0 flex-shrink-0">
                    <div className="flex items-center space-x-2">
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
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </HoverCardTrigger>
                      <HoverCardContent className="text-sm">
                        <p>{t(assetInfo.extendedDescriptionKey as any)}</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t(assetInfo.descriptionKey as any)}
                  </p>
                </CardHeader>
                <CardContent className="mt-auto relative z-10">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-foreground">
                      {t("asset-designer.type-selection.key-features")}
                    </h4>
                    <ul className="space-y-1.5">
                      {assetInfo.featureKeys.map((featureKey) => (
                        <li
                          key={featureKey.label}
                          className="flex items-center space-x-2"
                        >
                          {featureKey.status ? (
                            <CheckCircle2 className="h-4 w-4 text-sm-state-success-background flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-sm-state-error-background flex-shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {t(featureKey.label as any)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
