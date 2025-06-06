import { z } from "zod/v4";

export const secretCode = () =>
  z
    .string()
    .min(8, "Secret code must be at least 8 characters")
    .max(64, "Secret code must be at most 64 characters")
    .describe("Secret authentication code")
    .brand<"SecretCode">();

export type SecretCode = z.infer<ReturnType<typeof secretCode>>;

/**
 * Type guard to check if a value is a valid secret code
 * @param value - The value to check
 * @returns true if the value is a valid secret code
 */
export function isSecretCode(value: unknown): value is SecretCode {
  return secretCode().safeParse(value).success;
}

/**
 * Safely parse and return a secret code or throw an error
 * @param value - The value to parse
 * @returns The secret code if valid, throws when not
 */
export function getSecretCode(value: unknown): SecretCode {
  if (!isSecretCode(value)) {
    throw new Error(`Invalid secret code: ${value}`);
  }
  return value;
}
