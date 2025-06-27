import { beforeAll } from 'bun:test';
import { theGraphClient, theGraphGraphql } from '../utils/thegraph-client';

async function getLatestBlockNumber() {
  const response = await fetch('http://localhost:8545', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
      id: 1,
    }),
  });
  if (response.ok) {
    const data = (await response.json()) as {
      result: { number: `0x${string}` };
    };
    const latestBlockNumber = Number(data.result.number);
    console.log('Latest block number:', latestBlockNumber);
    return latestBlockNumber;
  }
  console.error('Failed to get latest block number');
  process.exit(1);
}

beforeAll(async () => {
  const latestBlockNumber = await getLatestBlockNumber();
  // Wait for the subgraph to be ready by polling the indexing status
  let isReady = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isReady && attempts < maxAttempts) {
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
        throw new Error('Subgraph has indexing errors');
      }
      if (
        typeof statusResponse._meta?.block.number === 'number' &&
        statusResponse._meta.block.number >= latestBlockNumber
      ) {
        console.log('Subgraph has indexed all blocks');
        isReady = true;
        break;
      }
      console.log(
        `Subgraph is not ready yet (blocks indexed: ${statusResponse._meta?.block.number}, latest block: ${latestBlockNumber}), waiting...`
      );
    } catch (error) {
      console.log('Subgraph is not ready yet, retrying...', error);
      // Ignore errors during polling
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds between attempts
  }

  if (!isReady) {
    throw new Error('Subgraph failed to start within timeout period');
  }
});
