import type { AssetDesignerStepSchema } from "@/components/asset-designer/steps";
import type { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { formOptions } from "@tanstack/react-form";
import type { z } from "zod";

export type AssetDesignerFormData = z.infer<typeof TokenCreateSchema> &
  z.infer<typeof AssetDesignerStepSchema>;

export const assetDesignerFormOptions = formOptions({
  defaultValues: {} as AssetDesignerFormData,
});
