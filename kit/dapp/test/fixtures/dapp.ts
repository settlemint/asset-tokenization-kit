import { createLogger } from "@settlemint/sdk-utils/logging";
import { config } from "dotenv";

const PORT = process.env.TEST_DAPP_PORT ?? "3000";

const logger = createLogger({ level: "info" });

config({ path: [".env", ".env.local"] });

export function getDappUrl() {
  return `http://localhost:${PORT}`;
}

export async function waitForApi() {
  try {
    const { startServer } = await import("@/orpc/server");
    const { stop } = await startServer(Number.parseInt(PORT));
    return { stop };
  } catch (error) {
    logger.error("Failed to start dApp api", error);
    process.exit(1);
  }
}
