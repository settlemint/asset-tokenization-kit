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

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "selectAssetType",
  } as AssetDesignerFormData,
});
