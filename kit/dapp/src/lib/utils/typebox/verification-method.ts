import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";

export type VerificationMethod = "two-factor" | "pincode";

/**
 * Enum of valid user roles
 */
export const verificationMethods: [VerificationMethod, VerificationMethod] = [
  "two-factor",
  "pincode",
];

/**
 * Validates a verification method
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates verification methods
 */
export const VerificationMethod = (options?: SchemaOptions) =>
  t.UnionEnum(verificationMethods, {
    ...options,
  });
