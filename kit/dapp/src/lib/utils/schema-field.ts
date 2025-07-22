import type { KeysOfUnion } from "@/lib/utils/union";
import { z } from "zod";
export const isRequiredFieldForZodObject = <TSchema extends z.ZodObject>(
  schema: TSchema,
  field: keyof z.infer<TSchema>
): boolean => {
  const fieldSchema = schema.shape[field as string];
  const isOptional = fieldSchema.safeParse({
    [field]: undefined,
  }).success;

  return !isOptional;
};

export const isRequiredFieldForZodIntersection = <
  TIntersection extends z.ZodIntersection,
>(
  intersection: TIntersection,
  field: KeysOfUnion<z.input<TIntersection>>
): boolean => {
  const schemas = [intersection.def.left, intersection.def.right];

  return schemas.some(
    (schema) =>
      schema instanceof z.ZodObject &&
      isRequiredFieldForZodObject(schema, field as string)
  );
};
