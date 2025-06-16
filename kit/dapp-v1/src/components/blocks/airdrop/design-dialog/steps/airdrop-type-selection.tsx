"use client";

import { AirdropTypeIcon } from "@/components/blocks/airdrop-type-icon/airdrop-type-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface AirdropTypeSelectionProps {
  selectedType: AirdropType | null;
  onSelect: (type: AirdropType) => void;
}

const airdropTypesInfo = [
  {
    type: "standard" as const,
    titleKey:
      "private.airdrops.create.type-selection.types.standard.title" as const,
    descriptionKey:
      "private.airdrops.create.type-selection.types.standard.description" as const,
    extendedDescriptionKey:
      "private.airdrops.create.type-selection.types.standard.extended-description" as const,
    featureKeys: [
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.user-initiated-claim" as const,
      },
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.time-bound" as const,
      },
      {
        status: false,
        label:
          "private.airdrops.create.type-selection.features.vesting-schedule" as const,
      },
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.batch-operations" as const,
      },
    ],
  },
  {
    type: "vesting" as const,
    titleKey:
      "private.airdrops.create.type-selection.types.vesting.title" as const,
    descriptionKey:
      "private.airdrops.create.type-selection.types.vesting.description" as const,
    extendedDescriptionKey:
      "private.airdrops.create.type-selection.types.vesting.extended-description" as const,
    featureKeys: [
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.user-initiated-claim" as const,
      },
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.time-bound" as const,
      },
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.vesting-schedule" as const,
      },
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.batch-operations" as const,
      },
    ],
  },
  {
    type: "push" as const,
    titleKey:
      "private.airdrops.create.type-selection.types.push.title" as const,
    descriptionKey:
      "private.airdrops.create.type-selection.types.push.description" as const,
    extendedDescriptionKey:
      "private.airdrops.create.type-selection.types.push.extended-description" as const,
    featureKeys: [
      {
        status: false,
        label:
          "private.airdrops.create.type-selection.features.user-initiated-claim" as const,
      },
      {
        status: false,
        label:
          "private.airdrops.create.type-selection.features.time-bound" as const,
      },
      {
        status: false,
        label:
          "private.airdrops.create.type-selection.features.vesting-schedule" as const,
      },
      {
        status: true,
        label:
          "private.airdrops.create.type-selection.features.batch-operations" as const,
      },
    ],
  },
];

export function AirdropTypeSelection({
  selectedType,
  onSelect,
}: AirdropTypeSelectionProps) {
  const t = useTranslations();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {t("private.airdrops.create.type-selection.title")}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {t("private.airdrops.create.type-selection.description")}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-4 px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 pb-4">
          {airdropTypesInfo.map((airdropInfo) => (
            <div key={airdropInfo.type} className="pl-2">
              <Card
                className={cn(
                  "flex flex-col h-full cursor-pointer transition-all duration-200 overflow-hidden",
                  "border relative gap-3",
                  selectedType === airdropInfo.type
                    ? "border-primary shadow-[0_2px_8px_rgba(0,0,0,0.05)] ring-1 ring-primary/20"
                    : "border-muted hover:border-primary/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                  selectedType === airdropInfo.type
                    ? "after:absolute after:inset-0 after:bg-primary/5"
                    : "hover:after:absolute hover:after:inset-0 hover:after:bg-accent/5"
                )}
                onClick={() => airdropInfo.type && onSelect(airdropInfo.type)}
              >
                <CardHeader className="relative z-10">
                  <div className="flex flex-row items-center justify-between pb-0 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      {airdropInfo.type && (
                        <AirdropTypeIcon type={airdropInfo.type} size="md" />
                      )}
                      <CardTitle className="text-base font-medium capitalize">
                        {t(airdropInfo.titleKey)}
                      </CardTitle>
                    </div>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </HoverCardTrigger>
                      <HoverCardContent className="text-sm">
                        <p>{t(airdropInfo.extendedDescriptionKey)}</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t(airdropInfo.descriptionKey)}
                  </p>
                </CardHeader>
                <CardContent className="mt-auto relative z-10">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-foreground">
                      {t("private.airdrops.create.type-selection.key-features")}
                    </h4>
                    <ul className="space-y-1.5">
                      {airdropInfo.featureKeys.map((featureKey) => (
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
                            {t(featureKey.label)}
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
