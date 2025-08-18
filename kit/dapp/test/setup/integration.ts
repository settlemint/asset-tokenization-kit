import { createLogger } from "@settlemint/sdk-utils/logging";
import { afterAll, beforeAll } from "vitest";
import { startApiServer } from "../fixtures/dapp";

const logger = createLogger({ level: "info" });

let stopApi: () => void;

export async function setup() {
  try {
    // Disable migrations for tests (only global one should run it)
    process.env.DISABLE_MIGRATIONS_ON_STARTUP = "true";
    // Start dapp api server
    const { stop } = await startApiServer();
    stopApi = stop;
  } catch (error: unknown) {
    logger.error("Failed to setup test environment", error);
    process.exit(1);
  }
}

export const teardown = () => {
  stopApi?.();
};

beforeAll(setup);
afterAll(teardown);
