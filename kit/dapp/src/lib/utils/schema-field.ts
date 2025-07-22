import type { z } from "zod";
export const isRequiredFieldForSchema = <TSchema extends z.ZodObject>(
  schema: TSchema,
  field: keyof z.input<TSchema>
): boolean => {
  const fieldSchema = schema.pick({
    [field]: true as const,
  });

  const isOptional = fieldSchema.safeParse({
    [field]: undefined,
  }).success;

  return !isOptional;
};
