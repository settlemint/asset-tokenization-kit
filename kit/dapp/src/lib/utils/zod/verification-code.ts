import { z } from "zod";

export const verificationCode = () =>
  z
    .string()
    .length(8, "Verification code must be exactly 8 characters")
    .regex(
      /^[A-Z0-9]{8}$/,
      "Verification code must contain only uppercase letters and digits"
    )
    .describe("Email verification code")
    .brand<"VerificationCode">();

export type VerificationCode = z.infer<ReturnType<typeof verificationCode>>;

/**
 * Type guard to check if a value is a valid verification code
 * @param value - The value to check
 * @returns true if the value is a valid verification code
 */
export function isVerificationCode(value: unknown): value is VerificationCode {
  return verificationCode().safeParse(value).success;
}

/**
 * Safely parse and return a verification code or throw an error
 * @param value - The value to parse
 * @returns The verification code if valid, throws when not
 */
export function getVerificationCode(value: unknown): VerificationCode {
  if (!isVerificationCode(value)) {
    throw new Error(`Invalid verification code: ${value}`);
  }
  return value;
}
