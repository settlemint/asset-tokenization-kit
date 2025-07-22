import { AssetDesignerStepSchema } from "@/components/asset-designer/steps";
import { isRequiredFieldForSchema } from "@/lib/utils/schema-field";
import { BondSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/bond.create.schema";
import { FundSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/fund.create.schema";
import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { formOptions } from "@tanstack/react-form";
import type { z } from "zod";

export const AssetDesignerFormSchema = TokenBaseSchema.extend(
  AssetDesignerStepSchema.shape
)
  .extend(BondSchema.partial().shape)
  .extend(FundSchema.partial().shape);

export type AssetDesignerFormInputData = z.input<
  typeof AssetDesignerFormSchema
>;

export const isRequiredField = (field: keyof AssetDesignerFormInputData) => {
  return isRequiredFieldForSchema(AssetDesignerFormSchema, field);
};

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "selectAssetType",
  } as AssetDesignerFormInputData,
});

export const onStepSubmit = () => {
  // Only used for typing
};
