import { encodeAbiParameters, parseAbiParameters, type Address } from "viem";

/**
 * Encodes identity parameters for compliance modules that use identity-based restrictions
 * Currently uses address array encoding, but can be extended for more complex identity structures
 * @param identities Array of identity addresses
 * @returns Encoded ABI parameters as hex string
 */
export const encodeIdentityParams = (identities: Address[]): string => {
  return encodeAbiParameters(parseAbiParameters("address[]"), [identities]);
};
