import { encodeAbiParameters, parseAbiParameters, type Address } from "viem";

/**
 * Encodes address parameters for compliance modules that use address-based restrictions
 * @param addresses Array of Ethereum addresses
 * @returns Encoded ABI parameters as hex string
 */
export const encodeAddressParams = (addresses: Address[]): string => {
  return encodeAbiParameters(parseAbiParameters("address[]"), [addresses]);
};
