import { type Address, getAddress } from "viem";
/**
 * Normalizes an Ethereum address to its canonical checksummed format
 * This ensures consistent address representation across the application
 *
 * @param address - The Ethereum address to normalize
 * @returns The normalized address in checksummed format
 */
export function normalizeAddress(address: Address): Address {
  return getAddress(address);
}
