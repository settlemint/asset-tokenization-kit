import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";

export type VerificationType = "two-factor" | "pincode";

/**
 * Enum of valid user roles
 */
export const verificationTypes: [VerificationType, VerificationType] = [
  "two-factor",
  "pincode",
];

/**
 * Validates a verification method
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates verification methods
 */
export const VerificationType = (options?: SchemaOptions) =>
  t.UnionEnum(verificationTypes, {
    ...options,
  });
