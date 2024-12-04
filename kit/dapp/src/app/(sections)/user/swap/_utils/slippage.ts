import { formatEther } from "viem";

export const calculateDynamicSlippage = (poolSize: bigint): number => {
  const poolEthValue = Number(formatEther(poolSize));

  if (poolEthValue < 100) return 20; // < 100 ETH
  if (poolEthValue < 1000) return 10; // < 1000 ETH
  if (poolEthValue < 10000) return 7.5; // < 10000 ETH
  return 5; // >= 10000 ETH
};
