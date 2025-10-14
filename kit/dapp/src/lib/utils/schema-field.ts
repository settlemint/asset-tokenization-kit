import type { KeysOfUnion } from "@/lib/utils/union";
import * as z from "zod";
export const isRequiredFieldForZodObject = <
  TSchema extends z.ZodObject<z.ZodRawShape>,
>(
  schema: TSchema,
  field: keyof z.infer<TSchema>
): boolean => {
  const shape = schema.shape;
  const fieldSchema = shape[field as string];
  if (!fieldSchema || !(fieldSchema instanceof z.ZodType)) {
    return false;
  }
  const isOptional = fieldSchema.safeParse(undefined).success;

  return !isOptional;
};

export const isRequiredFieldForZodIntersection = <
  TIntersection extends z.ZodIntersection,
>(
  intersection: TIntersection,
  field: KeysOfUnion<z.input<TIntersection>>
): boolean => {
  const schemas = [intersection.def.left, intersection.def.right];

  return isRequiredField(schemas, field as string);
};

export const isRequiredFieldForZodDiscriminatedUnion = <
  TDiscriminatedUnion extends z.ZodDiscriminatedUnion,
>(
  discriminatedUnion: TDiscriminatedUnion,
  field: KeysOfUnion<z.input<TDiscriminatedUnion>>
): boolean => {
  const schemas = discriminatedUnion.options;

  return isRequiredField(schemas, field as string);
};

const isRequiredField = (
  schemas: readonly z.core.SomeType[],
  field: string
) => {
  for (const schema of schemas) {
    let result = false;
    if (schema instanceof z.ZodObject) {
      result = isRequiredFieldForZodObject(schema, field);
    } else if (schema instanceof z.ZodIntersection) {
      result = isRequiredFieldForZodIntersection(schema, field as never);
    } else if (schema instanceof z.ZodDiscriminatedUnion) {
      result = isRequiredFieldForZodDiscriminatedUnion(schema, field as never);
    }
    if (result) {
      return true;
    }
  }
  return false;
};
