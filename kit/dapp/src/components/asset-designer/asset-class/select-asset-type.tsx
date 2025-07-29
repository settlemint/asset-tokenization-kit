import { Button } from "@/components/ui/button";
import {
  Card,
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
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
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

const validate: KeysOfUnion<AssetClassSelectionInputData>[] = ["assetType"];

export const SelectAssetType = withForm({
  ...assetClassSelectionFormOptions,
  props: {
    onStepSubmit: noop,
    onBack: noop,
    onCancel: noop,
  },
  render: function Render({ form, onStepSubmit, onBack, onCancel }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);

    // Get factories data
    const { data: factories } = useSuspenseQuery(
      orpc.token.factoryList.queryOptions({
        input: {},
      })
    );

    // Get current form values
    const assetClass = useStore(form.store, (state) => state.values.assetClass);

    // Filter factories for the selected asset class
    const selectedClassFactories = factories.filter(
      (factory) => getAssetClassFromFactoryTypeId(factory.typeId) === assetClass
    );

    return (
      <>
        <DialogHeader className="text-center mt-10">
          <DialogTitle className="text-2xl text-center">
            {t("asset-types:whichAssetType")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("asset-types:assetTypeDifferences")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 mb-10">
          <form.Field name="assetType">
            {(field) => (
              <>
                {selectedClassFactories.map((factory) => {
                  const assetType = getAssetTypeFromFactoryTypeId(
                    factory.typeId
                  );
                  const isSelected = field.state.value === assetType;

                  return (
                    <Card
                      key={factory.typeId}
                      className={`cursor-pointer transition-all min-w-0 flex flex-col h-full ${
                        isSelected
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => {
                        field.handleChange(assetType);
                      }}
                    >
                      <CardHeader className="flex-1">
                        <CardTitle className="text-lg">
                          {assetFactoryNames[factory.typeId]}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {t(`asset-types:types.${assetType}.description`)}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </>
            )}
          </form.Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t("asset-designer:form.buttons.back")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              {t("asset-designer:form.buttons.cancel")}
            </Button>
            <form.StepSubmitButton
              onStepSubmit={onStepSubmit}
              validate={validate}
              label={t("asset-designer:form.buttons.next")}
            />
          </div>
        </DialogFooter>
      </>
    );
  },
});
