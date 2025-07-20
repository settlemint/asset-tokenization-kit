import { AssetDesignerStepSchema } from "@/components/asset-designer/steps";
import type { AssetType } from "@/lib/zod/validators/asset-types";
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

const optionalFields: (keyof AssetDesignerFormInputData)[] = ["isin"];

// TODO: Get this from the schema somehow, this is a temporary solution
export const isRequiredField = (
  field: keyof AssetDesignerFormInputData,
  assetType: AssetType
) => {
  // Always optional fields
  if (optionalFields.includes(field)) {
    return false;
  }

  // Asset type specific required fields
  if (field === "cap" || field === "faceValue") {
    return assetType === "bond";
  }

  if (field === "managementFeeBps") {
    return assetType === "fund";
  }

  // All other fields are required for all asset types
  return true;
};

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "selectAssetType",
  } as AssetDesignerFormInputData,
});

export const onStepSubmit = () => {
  // Only used for typing
};
