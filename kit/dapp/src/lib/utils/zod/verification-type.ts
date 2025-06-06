import { z } from "zod/v4";

export const verificationTypes = ["email", "phone", "identity"] as const;

export const verificationType = () =>
  z
    .enum(verificationTypes)
    .describe("Type of verification")
    .brand<"VerificationType">();

export type VerificationType = z.infer<ReturnType<typeof verificationType>>;

/**
 * Type guard to check if a value is a valid verification type
 * @param value - The value to check
 * @returns true if the value is a valid verification type
 */
export function isVerificationType(value: unknown): value is VerificationType {
  return verificationType().safeParse(value).success;
}

/**
 * Safely parse and return a verification type or throw an error
 * @param value - The value to parse
 * @returns The verification type if valid, throws when not
 */
export function getVerificationType(value: unknown): VerificationType {
  if (!isVerificationType(value)) {
    throw new Error(`Invalid verification type: ${value}`);
  }
  return value;
}
