import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAssetClassFromFactoryTypeId } from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BanknoteArrowUpIcon,
  CreditCardIcon,
  PiggyBankIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AssetClassSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const assetClassIcons = {
  fixedIncome: PiggyBankIcon,
  flexibleIncome: BanknoteArrowUpIcon,
  cashEquivalent: CreditCardIcon,
};

const assetFactoryNames = {
  ATKBondFactory: "Bond",
  ATKEquityFactory: "Equity",
  ATKFundFactory: "Fund",
  ATKStableCoinFactory: "Stable Coin",
  ATKDepositFactory: "Deposit",
};

export function AssetClassSelectionModal({
  open,
  onOpenChange,
}: AssetClassSelectionModalProps) {
  const { t } = useTranslation(["navigation", "asset-types"]);
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Pre-group factories by asset class using select function
  // This reduces re-renders when factory data changes in ways that don't affect grouping
  const { data: groupedFactories } = useSuspenseQuery(
    orpc.token.factoryList.queryOptions({
      input: {},
      select: (factories) => ({
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
    })
  );

  // Use the grouped factories to create asset classes
  const assetClasses = [
    {
      id: "fixedIncome",
      name: t("fixedIncome"),
      description: t("asset-types:categories.fixedIncome.description"),
      icon: assetClassIcons.fixedIncome,
      factories: groupedFactories.fixedIncome,
    },
    {
      id: "flexibleIncome",
      name: t("flexibleIncome"),
      description: t("asset-types:categories.flexibleIncome.description"),
      icon: assetClassIcons.flexibleIncome,
      factories: groupedFactories.flexibleIncome,
    },
    {
      id: "cashEquivalent",
      name: t("cashEquivalent"),
      description: t("asset-types:categories.cashEquivalent.description"),
      icon: assetClassIcons.cashEquivalent,
      factories: groupedFactories.cashEquivalent,
    },
  ] as const;

  const handleNext = () => {
    if (selectedClass) {
      void navigate({
        to: "/asset-designer",
        search: { assetClass: selectedClass },
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
        <DialogHeader className="text-center mt-10">
          <DialogTitle className="text-2xl text-center">
            Which asset class do you want?
          </DialogTitle>
          <DialogDescription className="text-center">
            Each asset class offers a different risk-return profile.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 mb-10">
          {assetClasses.map((assetClass) => {
            const Icon = assetClass.icon;
            const isSelected = selectedClass === assetClass.id;

            return (
              <Card
                key={assetClass.id}
                className={`cursor-pointer transition-all min-w-0 flex flex-col h-full ${
                  isSelected
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedClass(assetClass.id);
                }}
              >
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{assetClass.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {assetClass.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Includes:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {assetClass.factories.map((factoryType) => (
                        <Badge key={factoryType.typeId} variant="outline">
                          {assetFactoryNames[factoryType.typeId]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={!selectedClass}>
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
