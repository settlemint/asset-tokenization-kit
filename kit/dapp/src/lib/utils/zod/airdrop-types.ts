import { z } from "zod";

export const airdropTypes = ["whitelist", "merkle", "claim"] as const;

export const airdropType = () =>
  z
    .enum(airdropTypes)
    .describe("Type of airdrop mechanism")
    .brand<"AirdropType">();

export type AirdropType = z.infer<ReturnType<typeof airdropType>>;

/**
 * Type guard to check if a value is a valid airdrop type
 * @param value - The value to check
 * @returns true if the value is a valid airdrop type
 */
export function isAirdropType(value: unknown): value is AirdropType {
  return airdropType().safeParse(value).success;
}

/**
 * Safely parse and return an airdrop type or throw an error
 * @param value - The value to parse
 * @returns The airdrop type if valid, throws when not
 */
export function getAirdropType(value: unknown): AirdropType {
  if (!isAirdropType(value)) {
    throw new Error(`Invalid airdrop type: ${value}`);
  }
  return value;
}
