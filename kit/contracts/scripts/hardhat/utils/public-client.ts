import hre from 'hardhat';
import { createPublicClient, custom, type PublicClient } from 'viem';
import { getViemChain } from './viem-chain';

let publicClientInstance: PublicClient | null = null;

/**
 * Returns a singleton PublicClient instance.
 * If the client has not been initialized, it will be initialized using the provided Hardhat Runtime Environment.
 * Subsequent calls will return the existing instance.
 *
 * @param hardhatRuntimeEnv - The Hardhat Runtime Environment, used to access network configuration for initialization.
 * @returns The PublicClient instance.
 * @throws Error if chainId is not found in Hardhat network configuration during initialization.
 */
export function getPublicClient(): PublicClient {
  if (publicClientInstance) {
    return publicClientInstance;
  }

  const viemChain = getViemChain();

  publicClientInstance = createPublicClient({
    chain: viemChain,
    transport: custom(hre.network.provider), // Use Hardhat's EIP-1193 provider
  });

  return publicClientInstance;
}
