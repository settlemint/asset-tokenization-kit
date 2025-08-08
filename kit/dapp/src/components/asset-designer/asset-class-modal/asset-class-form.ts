import { AssetClassSelectionStepsSchema } from "@/components/asset-designer/asset-class-modal/asset-class-steps";
import { isRequiredFieldForZodObject } from "@/lib/utils/schema-field";
import { KeysOfUnion } from "@/lib/utils/union";
import { assetClass, assetType } from "@/lib/zod/validators/asset-types";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const AssetClassSelectionSchema = z.object({
  assetClass: assetClass(),
  assetType: assetType(),
  step: AssetClassSelectionStepsSchema,
});

export type AssetClassSelectionInputData = z.input<
  typeof AssetClassSelectionSchema
>;

export const assetClassSelectionFormOptions = formOptions({
  defaultValues: {
    step: "assetClass",
  } as AssetClassSelectionInputData,
});
export const isRequiredField = (
  field: KeysOfUnion<AssetClassSelectionInputData>
) => {
  return isRequiredFieldForZodObject(AssetClassSelectionSchema, field);
};
