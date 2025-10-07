import { createLogger } from "@settlemint/sdk-utils/logging";
import { config } from "dotenv";

const logger = createLogger({ level: "info" });

config({ path: [".env", ".env.local"], quiet: true });

let dappUrl: string | undefined;

export function getDappUrl() {
  if (process.env.DAPP_URL) {
    return process.env.DAPP_URL;
  }
  return dappUrl ?? `http://localhost:3000`;
}

export async function startApiServer() {
  try {
    const { startServer } = await import("@/orpc/server");
    const { stop, url } = await startServer(0);
    dappUrl = url;
    return { stop, url };
  } catch (error) {
    logger.error("Failed to start dApp api", error);
    process.exit(1);
  }
}
