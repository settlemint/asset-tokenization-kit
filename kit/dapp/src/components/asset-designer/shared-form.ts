import type { AssetDesignerStepSchema } from "@/components/asset-designer/steps-schema";
import type { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { formOptions } from "@tanstack/react-form";
import type { z } from "zod";

export type AssetDesignerFormData = z.infer<typeof TokenCreateSchema> &
  z.infer<typeof AssetDesignerStepSchema>;

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "selectAssetType",
  } as AssetDesignerFormData,
});
