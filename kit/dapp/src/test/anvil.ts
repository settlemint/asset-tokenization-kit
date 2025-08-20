import { createPublicClient, http } from "viem";
import { anvil } from "viem/chains";

// Create a client to query blockchain time from anvil
const publicClient = createPublicClient({
  chain: anvil,
  transport: http("http://localhost:8545"),
});

// Helper function to get the current blockchain timestamp in milliseconds (like anvil)
export async function getAnvilTimeMilliseconds(): Promise<number> {
  const block = await publicClient.getBlock({ blockTag: "latest" });
  return Number(block.timestamp) * 1000; // Convert to milliseconds
}
