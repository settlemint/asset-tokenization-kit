import { AssetDesignerStepSchema } from "@/components/asset-designer/asset-designer-wizard/steps";
import { isRequiredFieldForZodIntersection } from "@/lib/utils/schema-field";
import type { KeysOfUnion } from "@/lib/utils/union";
import { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { formOptions } from "@tanstack/react-form";
import type { z } from "zod";

export const AssetDesignerFormSchema = TokenCreateSchema.and(
  AssetDesignerStepSchema
);

export type AssetDesignerFormInputData = z.input<
  typeof AssetDesignerFormSchema
>;

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "assetBasics",
    verification: {
      verificationCode: "",
      verificationType: "two-factor",
    },
  } as AssetDesignerFormInputData,
});

export const isRequiredField = (
  field: KeysOfUnion<AssetDesignerFormInputData>
) => {
  return isRequiredFieldForZodIntersection(AssetDesignerFormSchema, field);
};
