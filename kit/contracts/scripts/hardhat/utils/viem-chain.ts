import hre from "hardhat";
import * as viemChains from "viem/chains";

let viemChainInstance: viemChains.Chain | null = null;

// Helper function to get Viem chain object from chainId
export function getViemChain(): viemChains.Chain {
  if (viemChainInstance) {
    return viemChainInstance;
  }

  const chainId = hre.network.config?.chainId;

  if (chainId) {
    for (const chainKey in viemChains) {
      const chain = (viemChains as any)[chainKey] as viemChains.Chain;
      if (chain.id === chainId) {
        viemChainInstance = chain;
        return chain;
      }
    }
  }

  // Fallback to Anvil chain
  viemChainInstance = viemChains.anvil;

  return viemChainInstance;
}
