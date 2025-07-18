import { AssetDesignerStepSchema } from "@/components/asset-designer/steps";
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

export type AssetDesignerFormData = z.infer<typeof AssetDesignerFormSchema>;

const optionalFields: (keyof AssetDesignerFormData)[] = ["isin"];

// TODO: Get this from the schema somehow, this is a temporary solution
export const isRequiredField = (field: keyof AssetDesignerFormData) => {
  return !optionalFields.includes(field);
};

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "selectAssetType",
  } as AssetDesignerFormData,
});

export const onStepSubmit = () => {
  // Only used for typing
};
