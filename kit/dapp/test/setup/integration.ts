import { createLogger } from "@settlemint/sdk-utils/logging";
import { waitForApi } from "@test/fixtures/dapp";
import { afterAll, beforeAll } from "vitest";

const logger = createLogger({ level: "info" });

let stopApi: () => void;

export async function setup() {
  try {
    // Wait for dapp api to be ready
    const { stop } = await waitForApi();
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
