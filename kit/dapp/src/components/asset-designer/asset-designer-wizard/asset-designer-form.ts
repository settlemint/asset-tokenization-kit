import { AssetDesignerStepSchema } from "@/components/asset-designer/asset-designer-wizard/use-asset-designer-steps";
import { isRequiredFieldForZodIntersection } from "@/lib/utils/schema-field";
import type { KeysOfUnion } from "@/lib/utils/union";
import { assetClass } from "@/lib/zod/validators/asset-types";
import { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const AssetDesignerFormSchema = TokenCreateSchema.and(
  AssetDesignerStepSchema
).and(
  z.object({
    assetClass: assetClass(),
  })
);

export type AssetDesignerFormInputData = z.input<
  typeof AssetDesignerFormSchema
>;

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "assetClass",
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
