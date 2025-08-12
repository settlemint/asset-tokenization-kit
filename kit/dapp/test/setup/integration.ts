import { createLogger } from "@settlemint/sdk-utils/logging";
import { getDappPort } from "@test/fixtures/dapp";
import { config } from "dotenv";
import { getOrpcClient } from "../fixtures/orpc-client";
import {
  bootstrapSystem,
  bootstrapTokenFactories,
  setupDefaultIssuerRoles,
} from "../fixtures/system-bootstrap";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  setupUser,
  signInWithUser,
} from "../fixtures/user";

const logger = createLogger();

config({ path: [".env", ".env.local"] });

export async function setup() {
  try {
    // Wait for containerized dapp to be ready
    await waitForApi();

    // Parallelize user setup
    await Promise.all([
      setupUser(DEFAULT_ADMIN),
      setupUser(DEFAULT_INVESTOR),
      setupUser(DEFAULT_ISSUER),
    ]);

    const orpClient = getOrpcClient(await signInWithUser(DEFAULT_ADMIN));
    const system = await bootstrapSystem(orpClient);

    // Parallelize post-boot operations
    await Promise.all([
      bootstrapTokenFactories(orpClient, system),
      setupDefaultIssuerRoles(orpClient),
    ]);
  } catch (error: unknown) {
    logger.error("Failed to setup test environment", error);
    process.exit(1);
  }
}

let stopApi: () => void;

export const teardown = () => {
  stopApi?.();
};

async function waitForApi() {
  try {
    const { startServer } = await import("@/orpc/server");
    const { stop } = await startServer(getDappPort());
    stopApi = stop;
  } catch (error) {
    logger.error("Failed to start dApp api", error);
    process.exit(1);
  }
}
