import { AssetDesignerStepSchema } from "@/components/asset-designer/steps";
import { isRequiredFieldForZodIntersection } from "@/lib/utils/schema-field";
import type { KeysOfUnion } from "@/lib/utils/union";
import { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { formOptions, type AnyFormApi } from "@tanstack/react-form";
import type { z } from "zod";

export const AssetDesignerFormSchema = TokenCreateSchema.and(
  AssetDesignerStepSchema
);

export type AssetDesignerFormInputData = z.input<
  typeof AssetDesignerFormSchema
>;

export const assetDesignerFormOptions = formOptions({
  defaultValues: {
    step: "selectAssetType",
  } as AssetDesignerFormInputData,
});

export const isStepSubmitDisabled = (
  fields: KeysOfUnion<AssetDesignerFormInputData>[],
  form: AnyFormApi
) => {
  return isStepSubmitDisabledGeneric(fields, form, isRequiredField);
};

export const isRequiredField = (
  field: KeysOfUnion<AssetDesignerFormInputData>
) => {
  return isRequiredFieldForZodIntersection(AssetDesignerFormSchema, field);
};

export function isStepSubmitDisabledGeneric<T extends string[]>(
  fields: T,
  form: AnyFormApi,
  isRequiredField: (field: T[number]) => boolean
) {
  return fields.some((field) => {
    const meta = form.getFieldMeta(field);
    if (meta === undefined) {
      return true;
    }
    const errors = meta.errors;
    const isPristine = meta.isPristine;
    const isRequired = isRequiredField(field);
    const requiredFieldPristine = isRequired && isPristine;
    return errors.length > 0 || requiredFieldPristine;
  });
}
