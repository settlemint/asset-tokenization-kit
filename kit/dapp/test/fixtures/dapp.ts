import { createLogger } from "@settlemint/sdk-utils/logging";
import { config } from "dotenv";
import { startServer } from "@/orpc/server";

const logger = createLogger({ level: "info" });

config({ path: [".env", ".env.local"] });

let dappUrl: string | undefined;

export function getDappUrl() {
  return dappUrl ?? `http://localhost:3000`;
}

export async function startApiServer() {
  try {
    const { stop, url } = await startServer(0);
    dappUrl = url;
    return { stop, url };
  } catch (error) {
    logger.error("Failed to start dApp api", error);
    process.exit(1);
  }
}
