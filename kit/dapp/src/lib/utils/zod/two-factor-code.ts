import { z } from "zod/v4";

export const twoFactorCode = () =>
  z
    .string()
    .length(6, "2FA code must be exactly 6 digits")
    .regex(/^\d{6}$/, "2FA code must contain only digits")
    .describe("Two-factor authentication code")
    .brand<"TwoFactorCode">();

export type TwoFactorCode = z.infer<ReturnType<typeof twoFactorCode>>;

/**
 * Type guard to check if a value is a valid two-factor code
 * @param value - The value to check
 * @returns true if the value is a valid two-factor code
 */
export function isTwoFactorCode(value: unknown): value is TwoFactorCode {
  return twoFactorCode().safeParse(value).success;
}

/**
 * Safely parse and return a two-factor code or throw an error
 * @param value - The value to parse
 * @returns The two-factor code if valid, throws when not
 */
export function getTwoFactorCode(value: unknown): TwoFactorCode {
  if (!isTwoFactorCode(value)) {
    throw new Error(`Invalid two-factor code: ${value}`);
  }
  return value;
}
