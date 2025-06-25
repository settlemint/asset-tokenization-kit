#!/usr/bin/env bun

/**
 * graph-deploy.ts - Deploy SMART Protocol subgraph to local or remote Graph node
 *
 * This script replaces the shell script graph-deploy.sh with a modern Bun TypeScript
 * implementation that leverages Bun's native APIs for maximum performance.
 *
 * This script handles the deployment of the SMART Protocol subgraph by:
 * 1. Reading deployed contract addresses from Hardhat Ignition
 * 2. Updating the subgraph configuration with actual addresses
 * 3. Generating TypeScript code from the GraphQL schema
 * 4. Deploying to either a local Graph node or SettleMint
 *
 * Key Features:
 * - Uses Bun's native file operations, process spawning, and JSON parsing
 * - Robust cleanup functionality that restores original configuration on exit
 * - Comprehensive error handling with proper exit codes
 * - Structured logging with configurable levels
 * - Type-safe command line argument parsing
 *
 * Usage:
 *   bun run graph-deploy.ts --local    # Deploy to local Graph node
 *   bun run graph-deploy.ts --remote   # Deploy to SettleMint
 *   bun run graph-deploy.ts --help     # Show help
 */

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { join, relative } from "path";
import { parseArgs } from "util";
import { parse, stringify } from "yaml";
import { findTurboRoot, getKitProjectPath } from "../../../tools/root";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface DeploymentConfig {
  environment: "local" | "remote";
  deploymentPort: string;
  queryPort: string;
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
}

interface GraphPaths {
  projectRoot: string;
  kitRoot: string;
  subgraphRoot: string;
  contractsRoot: string;
  deployedAddressesFile: string;
  subgraphConfig: string;
  schemaFile: string;
  subgraphYaml: string;
}

interface DeployedAddresses {
  [contractName: string]: string;
}

interface SubgraphYamlConfig {
  dataSources: {
    name: string;
    source: {
      address: string;
    };
  }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
  INVALID_ARGS: 2,
  VALIDATION_FAILED: 3,
} as const;

type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

const GRAPH_NAME = "kit";
const GRAPH_VERSION_PREFIX = "v1.0.0";

// Create logger instance
const logger = createLogger({
  level:
    (process.env.LOG_LEVEL as LogLevel) ||
    (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) ||
    "info",
});

// ============================================================================
// GLOBAL STATE AND CLEANUP
// ============================================================================

let originalAddresses: DeployedAddresses | null = null;
let originalSubgraphYaml: string | null = null;
let graphPaths: GraphPaths | null = null;

/**
 * Cleanup function to restore original addresses on exit
 */
async function cleanup(): Promise<void> {
  // Restore subgraph.json
  if (originalAddresses && graphPaths?.subgraphConfig) {
    try {
      logger.info("Restoring original subgraph configuration...");
      await Bun.write(
        graphPaths.subgraphConfig,
        JSON.stringify(originalAddresses, null, 2)
      );
      logger.info("Original configuration restored");
    } catch (error) {
      logger.error("Failed to restore original configuration:", error);
    }
  }

  // Restore subgraph.yaml
  if (originalSubgraphYaml && graphPaths?.subgraphYaml) {
    try {
      logger.info("Restoring original subgraph.yaml...");
      await Bun.write(graphPaths.subgraphYaml, originalSubgraphYaml);
      logger.info("Original subgraph.yaml restored");
    } catch (error) {
      logger.error("Failed to restore original subgraph.yaml:", error);
    }
  }
}

/**
 * Set up cleanup handlers
 */
function setupCleanup(): void {
  // Handle various exit signals
  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

  for (const signal of signals) {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, cleaning up...`);
      await cleanup();
      process.exit(EXIT_CODES.SUCCESS);
    });
  }

  // Handle uncaught exceptions
  process.on("uncaughtException", async (error) => {
    logger.error("Uncaught exception:", error);
    await cleanup();
    process.exit(EXIT_CODES.ERROR);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", async (reason) => {
    logger.error("Unhandled promise rejection:", reason);
    await cleanup();
    process.exit(EXIT_CODES.ERROR);
  });

  // Handle normal exit
  process.on("beforeExit", cleanup);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show script usage information
 */
function showUsage(): void {
  logger.info(`
Usage: bun run graph-deploy.ts --local|--remote [OPTIONS]

Deploy the SMART Protocol subgraph to a Graph node.

Arguments:
  --local     Deploy to local Graph node
  --remote    Deploy to SettleMint platform

Options:
  -h, --help      Show this help message
  -p, --port      Graph node ports in format 'deployment:query' (default: 8020:8000)
                  (deployment port used for deploying subgraph, query port for GraphQL queries)
  -v, --verbose   Enable verbose output
  -q, --quiet     Suppress informational output
  -d, --debug     Enable debug mode (implies verbose)

Examples:
  # Deploy to local Graph node (default ports 8020:8000)
  bun run graph-deploy.ts --local

  # Deploy to local Graph node with custom ports (e.g., for anvil)
  bun run graph-deploy.ts --local --port 8120:8100

  # Deploy to SettleMint with verbose output
  bun run graph-deploy.ts --remote --verbose

Requirements:
  - Contracts must be deployed (deployed_addresses.json must exist)
  - For local deployment: Graph node running at localhost:<port>
  - For remote deployment: SettleMint CLI installed and authenticated
`);
}

/**
 * Parse command line arguments
 */
function parseArguments(): DeploymentConfig {
  try {
    const { values } = parseArgs({
      args: Bun.argv.slice(2),
      options: {
        local: { type: "boolean" },
        remote: { type: "boolean" },
        help: { type: "boolean", short: "h" },
        verbose: { type: "boolean", short: "v" },
        quiet: { type: "boolean", short: "q" },
        debug: { type: "boolean", short: "d" },
        port: {
          type: "string",
          short: "p",
          default: `${process.env.THE_GRAPH_PORT_LOCAL_DEPLOY || "8020"}:${process.env.THE_GRAPH_PORT_LOCAL_QUERY || "8000"}`,
        },
      },
      allowPositionals: false,
    });

    // Handle help
    if (values.help) {
      showUsage();
      process.exit(EXIT_CODES.SUCCESS);
    }

    // Validate deployment environment
    if (values.local && values.remote) {
      logger.error("Cannot specify both --local and --remote");
      showUsage();
      process.exit(EXIT_CODES.INVALID_ARGS);
    }

    if (!values.local && !values.remote) {
      logger.error("Deployment environment not specified");
      logger.error("Please use either --local or --remote");
      showUsage();
      process.exit(EXIT_CODES.INVALID_ARGS);
    }

    // Set log level based on flags
    // Note: SettleMint SDK logger level is set at creation time
    // Use LOG_LEVEL or SETTLEMINT_LOG_LEVEL env vars to control logging level
    if (values.debug || values.verbose || values.quiet) {
      const levelHint = values.debug
        ? "debug"
        : values.verbose
          ? "info"
          : "error";
      logger.debug(`Log level hint: ${levelHint} (set via env vars)`);
    }

    // Parse port configuration
    // Requires format: "deploymentPort:queryPort"
    if (!values.port.includes(":")) {
      logger.error(
        "Port must be specified in format 'deployment:query' (e.g., '8120:8100')"
      );
      showUsage();
      process.exit(EXIT_CODES.INVALID_ARGS);
    }

    const [deploymentPort, queryPort] = values.port.split(":");

    if (!deploymentPort || !queryPort) {
      logger.error(
        "Both deployment and query ports must be specified (e.g., '8120:8100')"
      );
      showUsage();
      process.exit(EXIT_CODES.INVALID_ARGS);
    }

    return {
      environment: values.local ? "local" : "remote",
      deploymentPort,
      queryPort,
      verbose: Boolean(values.verbose || values.debug),
      quiet: Boolean(values.quiet),
      debug: Boolean(values.debug),
    };
  } catch (error) {
    logger.error("Failed to parse arguments:", error);
    showUsage();
    process.exit(EXIT_CODES.INVALID_ARGS);
  }
}

/**
 * Initialize graph-specific paths
 */
async function initGraphPaths(): Promise<GraphPaths> {
  try {
    const { monorepoRoot, kitRoot } = await findTurboRoot();
    const subgraphRoot = await getKitProjectPath("subgraph");
    const contractsRoot = await getKitProjectPath("contracts");

    const paths: GraphPaths = {
      projectRoot: monorepoRoot,
      kitRoot,
      subgraphRoot,
      contractsRoot,
      deployedAddressesFile: join(
        contractsRoot,
        "ignition",
        "deployments",
        "atk-local",
        "deployed_addresses.json"
      ),
      subgraphConfig: join(subgraphRoot, "subgraph.json"),
      schemaFile: join(subgraphRoot, "schema.graphql"),
      subgraphYaml: join(subgraphRoot, "subgraph.yaml"),
    };

    logger.debug("Initialized graph paths:", paths);
    return paths;
  } catch (error) {
    logger.error("Failed to initialize graph paths:", error);
    throw error;
  }
}

/**
 * Validate environment and dependencies
 */
async function validateEnvironment(config: DeploymentConfig): Promise<void> {
  logger.info("Validating environment...");

  // Check if deployed addresses file exists
  const addressesFile = Bun.file(graphPaths!.deployedAddressesFile);
  if (!(await addressesFile.exists())) {
    logger.error(
      `Deployed addresses file not found: ${graphPaths!.deployedAddressesFile}`
    );
    logger.error("Please deploy contracts first using Hardhat Ignition");
    throw new Error("Missing deployed addresses");
  }

  // Check if subgraph schema exists
  const schemaFile = Bun.file(graphPaths!.schemaFile);
  if (!(await schemaFile.exists())) {
    logger.error(`Schema file not found: ${graphPaths!.schemaFile}`);
    throw new Error("Missing subgraph schema");
  }

  // Validate deployment-specific requirements
  if (config.environment === "local") {
    await validateLocalEnvironment(`http://localhost:${config.deploymentPort}`);
  } else {
    await validateRemoteEnvironment();
  }

  logger.info("Environment validation completed");
}

/**
 * Validate local deployment environment
 */
async function validateLocalEnvironment(node: string): Promise<void> {
  logger.info("Checking local Graph node...");

  try {
    const response = await fetch(`${node}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __schema { types { name } } }" }),
    });

    if (!response.ok) {
      throw new Error(`Graph node responded with status: ${response.status}`);
    }

    logger.info(`Local Graph node (${node}) is accessible`);
  } catch (error) {
    logger.error("Failed to connect to local Graph node:", error);
    logger.error(`Make sure Graph node is running at ${node}`);
    throw error;
  }
}

/**
 * Validate remote deployment environment
 */
async function validateRemoteEnvironment(): Promise<void> {
  logger.info("Checking SettleMint CLI...");

  try {
    await Bun.$`settlemint --version`.quiet();
    logger.info("SettleMint CLI is available");
  } catch (error) {
    logger.error("SettleMint CLI validation failed:", error);
    logger.error("Please install and authenticate SettleMint CLI");
    throw error;
  }
}

/**
 * Read deployed contract addresses
 */
async function readDeployedAddresses(): Promise<DeployedAddresses> {
  try {
    logger.info("Reading deployed contract addresses...");

    const addressesFile = Bun.file(graphPaths!.deployedAddressesFile);
    const addresses = (await addressesFile.json()) as DeployedAddresses;

    logger.debug("Deployed addresses:", addresses);
    logger.info(`Found ${Object.keys(addresses).length} deployed contracts`);

    return addresses;
  } catch (error) {
    logger.error("Failed to read deployed addresses:", error);
    throw error;
  }
}

/**
 * Update subgraph configuration with deployed addresses
 */
async function updateSubgraphConfig(
  addresses: DeployedAddresses
): Promise<void> {
  try {
    logger.info("Updating subgraph configuration...");

    const configFile = Bun.file(graphPaths!.subgraphConfig);

    // Backup original configuration if it exists
    if (await configFile.exists()) {
      originalAddresses = (await configFile.json()) as DeployedAddresses;
      logger.debug("Backed up original configuration");
    }

    // Write new configuration
    await Bun.write(
      graphPaths!.subgraphConfig,
      JSON.stringify(addresses, null, 2)
    );

    logger.info("Subgraph configuration updated");
  } catch (error) {
    logger.error("Failed to update subgraph configuration:", error);
    throw error;
  }
}

/**
 * Update subgraph yaml with deployed addresses
 */
async function updateSubgraphYaml(addresses: DeployedAddresses): Promise<void> {
  try {
    logger.info("Updating subgraph yaml...");

    const subgraphYaml = Bun.file(graphPaths!.subgraphYaml);

    if (!(await subgraphYaml.exists())) {
      logger.error("Subgraph yaml not found");
      throw new Error("Missing subgraph yaml");
    }

    // Backup original subgraph.yaml content if not already backed up
    const yamlContent = await subgraphYaml.text();
    if (!originalSubgraphYaml) {
      originalSubgraphYaml = yamlContent;
      logger.debug("Backed up original subgraph.yaml");
    }

    const subgraphYamlConfig = (await parse(yamlContent)) as SubgraphYamlConfig;

    // Update contract addresses
    const updatedSubgraphYamlConfig: typeof subgraphYamlConfig = {
      ...subgraphYamlConfig,
      dataSources: subgraphYamlConfig.dataSources.map((dataSource) => {
        const addressKey = Object.keys(addresses).find(
          (key) =>
            key.endsWith(`#${dataSource.name}`) ||
            key.endsWith(`#ATK${dataSource.name}`)
        );
        if (!addressKey) {
          logger.warn(`No address found for '${dataSource.name}'`);
        }
        const address = addressKey
          ? addresses[addressKey]!
          : dataSource.source.address;
        return {
          ...dataSource,
          source: {
            ...dataSource.source,
            address,
          },
        };
      }),
    };

    // Write new configuration
    await Bun.write(
      graphPaths!.subgraphYaml,
      stringify(updatedSubgraphYamlConfig)
    );

    logger.info("Subgraph yaml updated");
  } catch (error) {
    logger.error("Failed to update subgraph yaml:", error);
    throw error;
  }
}

/**
 * Generate TypeScript code from GraphQL schema
 */
async function generateCode(): Promise<void> {
  try {
    logger.info("Generating TypeScript code from GraphQL schema...");

    await Bun.$`bun run codegen`.cwd(graphPaths!.subgraphRoot);

    logger.info("TypeScript code generation completed");
  } catch (error) {
    logger.error("Failed to generate TypeScript code:", error);
    throw error;
  }
}

/**
 * Create local subgraph
 */
async function createLocalSubgraph(
  node: string,
  graphName: string = GRAPH_NAME
): Promise<void> {
  logger.info(`Creating local subgraph: ${graphName}`);

  try {
    // Create new subgraph
    await Bun.$`bunx graph create --node ${node} ${graphName}`.cwd(
      graphPaths!.subgraphRoot
    );
    logger.info(`Created subgraph: ${graphName}`);
  } catch (err) {
    const error = err as Error;
    logger.warn(
      `Failed to create subgraph (it may already exist): ${error.message}`
    );
    // Continue with deployment even if creation fails
  }
}

/**
 * Remove local subgraph
 */
async function removeLocalSubgraph(
  node: string,
  graphName: string = GRAPH_NAME
): Promise<void> {
  try {
    logger.info(`Removing local subgraph: ${graphName}`);
    await Bun.$`bunx graph remove --node ${node} ${graphName}`.cwd(
      graphPaths!.subgraphRoot
    );
    logger.info(`Removed subgraph: ${graphName}`);
  } catch (err) {
    const error = err as Error;
    logger.warn(
      `Failed to remove subgraph (it may not exist): ${error.message}`
    );
  }
}

/**
 * Deploy to local Graph node
 */
async function deployLocal(config: DeploymentConfig): Promise<void> {
  try {
    const graphName = GRAPH_NAME;
    const versionLabel = `${GRAPH_VERSION_PREFIX}.${Date.now()}`;
    const deploymentNode = `http://localhost:${config.deploymentPort}`;
    const queryNode = `http://localhost:${config.queryPort}`;

    logger.info("Deploying subgraph locally...");
    logger.info(`  Name: ${graphName}`);
    logger.info(`  Version: ${versionLabel}`);
    logger.info(`  Deployment Node: ${deploymentNode}`);
    logger.info(`  Query Node: ${queryNode}`);
    logger.info(`  IPFS: https://ipfs.console.settlemint.com`);

    // Remove existing subgraph first
    await removeLocalSubgraph(deploymentNode, graphName);

    // Create subgraph first
    await createLocalSubgraph(deploymentNode, graphName);

    // Deploy subgraph
    await Bun.$`bunx graph deploy --version-label ${versionLabel} --node ${deploymentNode} --ipfs https://ipfs.console.settlemint.com ${graphName} ${graphPaths!.subgraphYaml}`.cwd(
      graphPaths!.subgraphRoot
    );

    logger.info("Subgraph deployed successfully!");
    logger.info(`  Deployment endpoint: ${deploymentNode}`);
    logger.info(`  Query endpoint: ${queryNode}/subgraphs/name/${graphName}`);
    logger.info(`  Note: Use POST requests to query the GraphQL endpoint`);
  } catch (error) {
    logger.error("Local deployment failed:", error);
    throw error;
  }
}

/**
 * Deploy to SettleMint
 */
async function deployRemote(): Promise<void> {
  try {
    logger.info("Deploying to SettleMint...");

    // Change to project root for SettleMint deployment
    await Bun.$`bunx settlemint scs subgraph deploy`.cwd(
      graphPaths!.projectRoot
    );

    logger.info("Subgraph deployed to SettleMint successfully!");
  } catch (error) {
    logger.error("SettleMint deployment failed:", error);
    throw error;
  }
}

/**
 * Execute local deployment workflow
 */
async function executeLocalWorkflow(config: DeploymentConfig): Promise<void> {
  try {
    const addresses = await readDeployedAddresses();
    await updateSubgraphConfig(addresses);
    await updateSubgraphYaml(addresses);
    await generateCode();
    await deployLocal(config);
  } catch (error) {
    logger.error("Local deployment workflow failed:", error);
    throw error;
  }
}

/**
 * Execute remote deployment workflow
 */
async function executeRemoteWorkflow(): Promise<void> {
  try {
    const addresses = await readDeployedAddresses();
    await updateSubgraphConfig(addresses);
    await generateCode();
    await deployRemote();
  } catch (error) {
    logger.error("Remote deployment workflow failed:", error);
    throw error;
  }
}

/**
 * Print deployment header
 */
function printHeader(config: DeploymentConfig): void {
  logger.info("=".repeat(60));
  logger.info("SMART Protocol Subgraph Deployment");
  logger.info("=".repeat(60));
  logger.info(`Deployment target: ${config.environment}`);
  logger.info(
    `Project root: ${relative(process.cwd(), graphPaths!.projectRoot)}`
  );
  logger.info(
    `Subgraph root: ${relative(process.cwd(), graphPaths!.subgraphRoot)}`
  );
  logger.info("=".repeat(60));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main execution function
 */
async function main(): Promise<void> {
  let exitCode: ExitCode = EXIT_CODES.SUCCESS;

  try {
    // Set up cleanup handlers
    setupCleanup();

    // Parse command line arguments
    const config = parseArguments();

    // Initialize paths
    graphPaths = await initGraphPaths();

    // Print header
    printHeader(config);

    // Validate environment
    await validateEnvironment(config);

    // Execute deployment workflow
    if (config.environment === "local") {
      await executeLocalWorkflow(config);
    } else {
      await executeRemoteWorkflow();
    }

    logger.info("Deployment completed successfully!");
  } catch (error) {
    logger.error("Deployment failed:", error);
    exitCode = EXIT_CODES.ERROR;
  } finally {
    // Cleanup will be called by the beforeExit handler
    process.exit(exitCode);
  }
}

// Run main function if script is executed directly
if (import.meta.main) {
  await main();
}
