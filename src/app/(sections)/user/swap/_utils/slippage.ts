import { formatEther } from "viem";

export const calculateDynamicSlippage = (poolSize: bigint): string => {
  const poolEthValue = Number(formatEther(poolSize));

  if (poolEthValue < 100) return "2.00"; // < 100 ETH
  if (poolEthValue < 1000) return "1.00"; // < 1000 ETH
  if (poolEthValue < 10000) return "0.75"; // < 10000 ETH
  return "0.50"; // >= 10000 ETH
};
