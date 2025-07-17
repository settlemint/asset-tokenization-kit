import { beforeAll } from "bun:test";
import { theGraphClient, theGraphGraphql } from "../utils/thegraph-client";

interface ServiceHealthStatus {
  name: string;
  healthy: boolean;
  error?: string;
  responseTime?: number;
}

interface GraphNodeStatus {
  isResponsive: boolean;
  hasSubgraph: boolean;
  isIndexing: boolean;
  currentBlock: number;
  latestBlock: number;
  hasErrors: boolean;
  error?: string;
}

const createLogger = (phase: string) => ({
  info: (msg: string, ...args: any[]) =>
    console.log(`[${phase}] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) =>
    console.error(`[${phase}] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) =>
    console.warn(`[${phase}] ${msg}`, ...args),
});

async function checkServiceHealth(
  name: string,
  url: string,
  timeout = 5000
): Promise<ServiceHealthStatus> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    return {
      name,
      healthy: response.ok,
      responseTime,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      name,
      healthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function getLatestBlockNumber(): Promise<number> {
  const logger = createLogger("BLOCKCHAIN");

  try {
    const response = await fetch("http://localhost:8545", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", false],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      result: { number: `0x${string}` };
      error?: { message: string };
    };

    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }

    const latestBlockNumber = Number(data.result.number);
    logger.info(`Latest block number: ${latestBlockNumber}`);

    if (latestBlockNumber === 0) {
      logger.warn(
        "Blockchain is at genesis block - this might indicate no transactions yet"
      );
    }

    return latestBlockNumber;
  } catch (error) {
    logger.error("Failed to get latest block number:", error);
    throw error;
  }
}

async function checkGraphNodeStatus(): Promise<GraphNodeStatus> {
  const logger = createLogger("GRAPH_NODE");

  try {
    // First check if Graph Node is responsive
    const healthResponse = await fetch("http://localhost:8000/", {
      method: "GET",
      headers: { Accept: "text/html" },
    });

    if (!healthResponse.ok) {
      return {
        isResponsive: false,
        hasSubgraph: false,
        isIndexing: false,
        currentBlock: 0,
        latestBlock: 0,
        hasErrors: true,
        error: `Graph Node not responsive: HTTP ${healthResponse.status}`,
      };
    }

    logger.info("Graph Node is responsive");

    // Check indexing status via GraphQL
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
      return {
        isResponsive: true,
        hasSubgraph: true,
        isIndexing: false,
        currentBlock: statusResponse._meta.block.number || 0,
        latestBlock: 0,
        hasErrors: true,
        error: "Subgraph has indexing errors",
      };
    }

    return {
      isResponsive: true,
      hasSubgraph: true,
      isIndexing: true,
      currentBlock: statusResponse._meta?.block.number || 0,
      latestBlock: 0,
      hasErrors: false,
    };
  } catch (error) {
    logger.error("Failed to check Graph Node status:", error);

    // Check if this is a "not started syncing" error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNotSyncingError = errorMessage.includes("not started syncing yet");

    return {
      isResponsive: true,
      hasSubgraph: !isNotSyncingError,
      isIndexing: false,
      currentBlock: 0,
      latestBlock: 0,
      hasErrors: true,
      error: errorMessage,
    };
  }
}

async function waitWithExponentialBackoff(
  checkFunction: () => Promise<boolean>,
  options: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
    phaseName: string;
  }
): Promise<boolean> {
  const logger = createLogger(options.phaseName);
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    logger.info(
      `Attempt ${attempt}/${options.maxAttempts} (delay: ${delay}ms)`
    );

    try {
      const result = await checkFunction();
      if (result) {
        logger.info(`Success after ${attempt} attempts`);
        return true;
      }
    } catch (error) {
      logger.error(`Attempt ${attempt} failed:`, error);
    }

    if (attempt < options.maxAttempts) {
      logger.info(`Waiting ${delay}ms before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * options.backoffFactor, options.maxDelay);
    }
  }

  logger.error(`Failed after ${options.maxAttempts} attempts`);
  return false;
}

beforeAll(async () => {
  const startTime = Date.now();
  const isCI = process.env.CI === "true";
  const logger = createLogger("SETUP");

  logger.info("=== Starting Subgraph Integration Test Setup ===");
  logger.info(`Environment: ${isCI ? "CI" : "Local"}`);
  logger.info(`Timestamp: ${new Date().toISOString()}`);

  try {
    // Phase 1: Check service health
    logger.info("Phase 1: Checking service health...");
    // Note: Postgres health is verified by Docker's depends_on condition using pg_isready
    // We only check HTTP services here since PostgreSQL uses database protocol, not HTTP
    const services = await Promise.all([
      checkServiceHealth("Anvil", "http://localhost:8545"),
      checkServiceHealth("Graph Node", "http://localhost:8000"),
    ]);

    services.forEach((service) => {
      if (service.healthy) {
        logger.info(`✓ ${service.name} is healthy (${service.responseTime}ms)`);
      } else {
        logger.error(
          `✗ ${service.name} is unhealthy: ${service.error} (${service.responseTime}ms)`
        );
      }
    });

    const unhealthyServices = services.filter((s) => !s.healthy);
    if (unhealthyServices.length > 0) {
      throw new Error(
        `Unhealthy services: ${unhealthyServices.map((s) => s.name).join(", ")}`
      );
    }

    // Phase 2: Get blockchain state
    logger.info("Phase 2: Checking blockchain state...");
    const latestBlockNumber = await getLatestBlockNumber();

    // Phase 3: Wait for Graph Node to be responsive
    logger.info("Phase 3: Waiting for Graph Node to be responsive...");
    const graphNodeReady = await waitWithExponentialBackoff(
      async () => {
        const status = await checkGraphNodeStatus();
        return status.isResponsive;
      },
      {
        maxAttempts: isCI ? 20 : 10,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 1.5,
        phaseName: "GRAPH_NODE_HEALTH",
      }
    );

    if (!graphNodeReady) {
      throw new Error("Graph Node failed to become responsive");
    }

    // Phase 4: Wait for subgraph deployment detection
    logger.info("Phase 4: Waiting for subgraph deployment...");
    const subgraphDeployed = await waitWithExponentialBackoff(
      async () => {
        const status = await checkGraphNodeStatus();
        logger.info(
          `Graph Node status: responsive=${status.isResponsive}, hasSubgraph=${status.hasSubgraph}, error=${status.error}`
        );
        return (
          status.hasSubgraph &&
          !status.error?.includes("not started syncing yet")
        );
      },
      {
        maxAttempts: isCI ? 30 : 15,
        initialDelay: 2000,
        maxDelay: 10000,
        backoffFactor: 1.3,
        phaseName: "SUBGRAPH_DEPLOYMENT",
      }
    );

    if (!subgraphDeployed) {
      throw new Error("Subgraph deployment not detected");
    }

    // Phase 5: Wait for indexing to start
    logger.info("Phase 5: Waiting for indexing to start...");
    const indexingStarted = await waitWithExponentialBackoff(
      async () => {
        const status = await checkGraphNodeStatus();
        logger.info(
          `Indexing status: isIndexing=${status.isIndexing}, currentBlock=${status.currentBlock}, hasErrors=${status.hasErrors}`
        );
        return status.isIndexing && !status.hasErrors;
      },
      {
        maxAttempts: isCI ? 30 : 15,
        initialDelay: 2000,
        maxDelay: 10000,
        backoffFactor: 1.3,
        phaseName: "INDEXING_START",
      }
    );

    if (!indexingStarted) {
      throw new Error("Subgraph indexing failed to start");
    }

    // Phase 6: Wait for sync to catch up
    logger.info("Phase 6: Waiting for sync to catch up...");
    const syncCompleted = await waitWithExponentialBackoff(
      async () => {
        const status = await checkGraphNodeStatus();
        const isSynced = status.currentBlock >= latestBlockNumber;
        logger.info(
          `Sync progress: ${status.currentBlock}/${latestBlockNumber} (${isSynced ? "synced" : "syncing"})`
        );
        return isSynced;
      },
      {
        maxAttempts: isCI ? 20 : 10,
        initialDelay: 3000,
        maxDelay: 10000,
        backoffFactor: 1.2,
        phaseName: "SYNC_CATCHUP",
      }
    );

    if (!syncCompleted) {
      throw new Error("Subgraph failed to sync within timeout period");
    }

    const totalTime = Date.now() - startTime;
    logger.info(`=== Setup completed successfully in ${totalTime}ms ===`);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error(`=== Setup failed after ${totalTime}ms ===`);
    logger.error("Error details:", error);

    // Final diagnostic check
    try {
      const finalStatus = await checkGraphNodeStatus();
      logger.error("Final Graph Node status:", finalStatus);
    } catch (diagError) {
      logger.error("Could not perform final diagnostic check:", diagError);
    }

    throw error;
  }
});
