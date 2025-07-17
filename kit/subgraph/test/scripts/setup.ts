import { beforeAll } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

async function getLatestBlockNumber() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Checking blockchain connectivity...`);
  
  const response = await fetch("http://localhost:8545", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: ["latest", false],
      id: 1,
    }),
  });
  if (response.ok) {
    const data = (await response.json()) as {
      result: { number: `0x${string}` };
    };
    const latestBlockNumber = Number(data.result.number);
    console.log(`[${timestamp}] ✓ Blockchain connected. Latest block number: ${latestBlockNumber}`);
    return latestBlockNumber;
  }
  console.error(`[${timestamp}] ✗ Failed to get latest block number. HTTP status: ${response.status}`);
  process.exit(1);
}

function getDelay(attempt: number): number {
  if (attempt <= 10) return 3_000; // First 10 attempts: 3s
  if (attempt <= 20) return 6_000; // Next 10 attempts: 6s
  if (attempt <= 30) return 9_000; // Next 10 attempts: 9s
  return 15_000; // Final attempts: 15s
}

beforeAll(async () => {
  const latestBlockNumber = await getLatestBlockNumber();
  // Wait for the subgraph to be ready by polling the indexing status
  let isReady = false;
  let attempts = 0;
  const maxAttempts = 40; // Increased from 10 to 40 (up to 120s total)

  console.log(`[${new Date().toISOString()}] Waiting for subgraph to be ready (max ${maxAttempts} attempts)...`);

  while (!isReady && attempts < maxAttempts) {
    attempts++;
    const timestamp = new Date().toISOString();
    const delay = getDelay(attempts);
    
    try {
      const statusQuery = theGraphGraphql(`
        query {
          _meta {
            hasIndexingErrors
            block {
              number
            }
          }
        }
      `);
      const statusResponse = await theGraphClient.request(statusQuery);
      
      if (statusResponse._meta?.hasIndexingErrors) {
        throw new Error("Subgraph has indexing errors");
      }
      
      if (
        typeof statusResponse._meta?.block.number === "number" &&
        statusResponse._meta.block.number >= latestBlockNumber
      ) {
        console.log(`[${timestamp}] ✓ Subgraph is ready! Indexed ${statusResponse._meta.block.number} blocks (attempt ${attempts}/${maxAttempts})`);
        isReady = true;
        break;
      }
      
      console.log(
        `[${timestamp}] ⏳ Subgraph not ready (attempt ${attempts}/${maxAttempts}): indexed ${statusResponse._meta?.block.number}/${latestBlockNumber} blocks. Waiting ${delay/1000}s...`
      );
    } catch (error) {
      console.log(`[${timestamp}] ⚠️ Subgraph check failed (attempt ${attempts}/${maxAttempts}): ${error instanceof Error ? error.message : String(error)}. Retrying in ${delay/1000}s...`);
    }

    if (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (!isReady) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ✗ Subgraph failed to start within timeout period (${maxAttempts} attempts)`);
    console.error(`[${timestamp}] Final state: blockchain at block ${latestBlockNumber}, subgraph connection failed`);
    throw new Error(`Subgraph failed to start within timeout period (${maxAttempts} attempts)`);
  }
});
