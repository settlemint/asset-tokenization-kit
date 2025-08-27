import { createPublicClient, http, isAddress } from "viem";
import { anvil } from "viem/chains";

// Create a client to query blockchain time from anvil
export const publicClient = createPublicClient({
  chain: anvil,
  transport: http("http://localhost:8545"),
});

// Helper function to get the current blockchain timestamp in milliseconds (like anvil)
export async function getAnvilTimeMilliseconds(): Promise<number> {
  const block = await publicClient.getBlock({ blockTag: "latest" });
  return Number(block.timestamp) * 1000; // Convert to milliseconds
}

export async function isContractAddress(address: string) {
  if (!isAddress(address)) {
    return false;
  }
  const code = await publicClient.getCode({ address });
  if (code === "0x") {
    return false;
  }

  return true;
}
