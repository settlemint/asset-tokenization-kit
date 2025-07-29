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
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
  type AssetFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  BanknoteArrowUpIcon,
  CreditCardIcon,
  PiggyBankIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedFactory, setSelectedFactory] =
    useState<AssetFactoryTypeId | null>(null);

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
    if (currentStep === 1 && selectedClass) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedFactory && selectedClass) {
      void navigate({
        to: "/asset-designer",
        search: { assetClass: selectedClass, factoryType: selectedFactory },
      });
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedFactory(null);
    }
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setSelectedClass(null);
    setSelectedFactory(null);
    onOpenChange(false);
  };

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setSelectedClass(null);
      setSelectedFactory(null);
    }
  }, [open]);

  // Get the selected asset class data for step 2
  const selectedAssetClass = selectedClass
    ? assetClasses.find((ac) => ac.id === selectedClass)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-4xl lg:max-w-6xl overflow-hidden">
        {currentStep === 1 ? (
          <>
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
                        <CardTitle className="text-lg">
                          {assetClass.name}
                        </CardTitle>
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

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!selectedClass}>
                Next
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="text-center mt-10">
              <DialogTitle className="text-2xl text-center">
                Which asset do you want?
              </DialogTitle>
              <DialogDescription className="text-center">
                Choose a specific asset type from the {selectedAssetClass?.name}{" "}
                class. Each asset type has distinct characteristics:
                {selectedAssetClass?.id === "flexibleIncome" && (
                  <span className="block mt-1 text-sm">
                    <strong>Equity</strong> offers direct ownership with voting
                    rights, while <strong>Fund</strong> provides pooled
                    investment with professional management.
                  </span>
                )}
                {selectedAssetClass?.id === "cashEquivalent" && (
                  <span className="block mt-1 text-sm">
                    <strong>Stablecoin</strong> maintains value through digital
                    mechanisms, while <strong>Deposit</strong> offers guaranteed
                    returns through time-locked savings.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 mb-10">
              {selectedAssetClass?.factories.map((factory) => {
                const isSelected = selectedFactory === factory.typeId;

                return (
                  <Card
                    key={factory.typeId}
                    className={`cursor-pointer transition-all min-w-0 flex flex-col h-full ${
                      isSelected
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedFactory(factory.typeId);
                    }}
                  >
                    <CardHeader className="flex-1">
                      <CardTitle className="text-lg">
                        {assetFactoryNames[factory.typeId]}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {t(
                          `asset-types:types.${getAssetTypeFromFactoryTypeId(factory.typeId)}.description`
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleNext} disabled={!selectedFactory}>
                  Next
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
