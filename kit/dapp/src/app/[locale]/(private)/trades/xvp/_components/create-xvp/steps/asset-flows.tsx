"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import { Button } from "@/components/ui/button";
import type {
  AssetFlow,
  CreateXvpInput,
} from "@/lib/mutations/xvp/create/create-schema";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

export function AssetFlows() {
  const t = useTranslations("trade-management.forms.asset-flows");
  const { control } = useFormContext<CreateXvpInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "flows",
  });

  const addFlow = () => {
    append({
      asset: undefined,
      amount: "",
      from: "" as Address,
      to: "",
    } as unknown as AssetFlow);
  };

  // Add a default flow if there are none
  if (fields.length === 0) {
    addFlow();
  }

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="space-y-6">
        {fields.map((field, index) => (
          <AssetFlowCard
            key={field.id}
            index={index}
            onRemove={() => fields.length > 1 && remove(index)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full mt-6"
        onClick={addFlow}
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("add-flow")}
      </Button>
    </FormStep>
  );
}

function AssetFlowCard({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  const t = useTranslations("trade-management.forms.asset-flows");
  const { control } = useFormContext<CreateXvpInput>();

  // Watch for the selected asset to get decimals
  const asset = useWatch({
    control,
    name: `flows.${index}.asset`,
  });

  return (
    <div className="border rounded-lg bg-card/30 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">
          {t("flow", { index: index + 1 })}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t("remove-flow")}</span>
        </Button>
      </div>

      <FormAssets
        control={control}
        name={`flows.${index}.asset`}
        label={t("asset")}
        placeholder={t("asset-placeholder")}
        required
      />

      <FormInput
        control={control}
        name={`flows.${index}.amount`}
        label={t("amount")}
        placeholder={t("amount-placeholder")}
        required
        type="number"
        step={asset?.decimals ? 10 ** -asset.decimals : 1}
        postfix={asset?.symbol}
      />

      <FormUsers
        control={control}
        name={`flows.${index}.from`}
        label={t("from-address")}
        placeholder={t("from-placeholder")}
        required
      />

      <FormUsers
        control={control}
        name={`flows.${index}.to`}
        label={t("to-address")}
        placeholder={t("to-placeholder")}
        required
      />
    </div>
  );
}

AssetFlows.validatedFields = ["flows"] as (keyof CreateXvpInput)[];
