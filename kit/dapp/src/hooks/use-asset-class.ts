import { orpc } from "@/orpc/orpc-client";
import {
  type AssetClass,
  getAssetClassFromFactoryTypeId,
} from "@atk/zod/asset-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  BanknoteArrowUpIcon,
  CreditCardIcon,
  type LucideIcon,
  PiggyBankIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Hook that provides asset class data with grouped factories.
 * Centralizes the query logic and asset class definitions to avoid duplication.
 * @returns Object containing grouped factories and complete asset class definitions
 */
export function useAssetClass() {
  const { t } = useTranslation(["asset-class"]);

  // Fetch all factories
  const { data: factories } = useSuspenseQuery(
    orpc.system.factory.list.queryOptions({
      input: {},
    })
  );

  // Group factories by asset class
  const groupedFactories = useMemo(
    () => ({
      hasFactories: factories.length > 0,
      fixedIncome: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "fixedIncome"
      ),
      flexibleIncome: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "flexibleIncome"
      ),
      cashEquivalent: factories.filter(
        (factory) =>
          getAssetClassFromFactoryTypeId(factory.typeId) === "cashEquivalent"
      ),
    }),
    [factories]
  );

  // Create asset classes with translations and factories
  const assetClasses = useMemo(
    () => [
      {
        id: "fixedIncome" as const,
        name: t("categories.fixedIncome.name"),
        description: t("categories.fixedIncome.description"),
        icon: assetClassIcon.fixedIncome,
        factories: groupedFactories.fixedIncome,
      },
      {
        id: "flexibleIncome" as const,
        name: t("categories.flexibleIncome.name"),
        description: t("categories.flexibleIncome.description"),
        icon: assetClassIcon.flexibleIncome,
        factories: groupedFactories.flexibleIncome,
      },
      {
        id: "cashEquivalent" as const,
        name: t("categories.cashEquivalent.name"),
        description: t("categories.cashEquivalent.description"),
        icon: assetClassIcon.cashEquivalent,
        factories: groupedFactories.cashEquivalent,
      },
    ],
    [groupedFactories, t]
  );

  return { groupedFactories, assetClasses };
}

export const assetClassIcon: Record<AssetClass, LucideIcon> = {
  fixedIncome: PiggyBankIcon,
  flexibleIncome: BanknoteArrowUpIcon,
  cashEquivalent: CreditCardIcon,
};
