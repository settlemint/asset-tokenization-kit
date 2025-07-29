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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { useAssetClass } from "@/hooks/use-asset-class";
import { useTranslation } from "react-i18next";
import {
  assetClassSelectionFormOptions,
  type AssetClassSelectionInputData,
} from "./shared-form";

const assetFactoryNames = {
  ATKBondFactory: "Bond",
  ATKEquityFactory: "Equity",
  ATKFundFactory: "Fund",
  ATKStableCoinFactory: "Stable Coin",
  ATKDepositFactory: "Deposit",
};

const validate: KeysOfUnion<AssetClassSelectionInputData>[] = ["assetClass"];

export const SelectAssetClass = withForm({
  ...assetClassSelectionFormOptions,
  props: {
    onStepSubmit: noop,
    onCancel: noop,
  },
  render: function Render({ form, onStepSubmit, onCancel }) {
    const { t } = useTranslation(["asset-class", "asset-designer"]);
    const { assetClasses } = useAssetClass();

    return (
      <>
        <DialogHeader className="text-center mt-10">
          <DialogTitle className="text-2xl text-center">
            {t("asset-class:whichAssetClass")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("asset-class:assetClassDifferences")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 mb-10">
          <form.Field name="assetClass">
            {(field) => (
              <>
                {assetClasses.map((assetClass) => {
                  const Icon = assetClass.icon;
                  const isSelected = field.state.value === assetClass.id;

                  return (
                    <Card
                      key={assetClass.id}
                      className={`cursor-pointer transition-all min-w-0 flex flex-col h-full ${
                        isSelected
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => {
                        field.handleChange(assetClass.id);
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
              </>
            )}
          </form.Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("asset-designer:form.buttons.cancel")}
          </Button>

          <form.StepSubmitButton
            onStepSubmit={onStepSubmit}
            validate={validate}
            label={t("asset-designer:form.buttons.next")}
          />
        </DialogFooter>
      </>
    );
  },
});
