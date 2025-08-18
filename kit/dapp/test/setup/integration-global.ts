import { createLogger } from "@settlemint/sdk-utils/logging";
import { startApiServer } from "../fixtures/dapp";
import { getOrpcClient } from "../fixtures/orpc-client";
import {
  bootstrapAddons,
  bootstrapSystem,
  bootstrapTokenFactories,
  createAndRegisterUserIdentities,
  setDefaultSystemSettings,
  setupDefaultIssuerRoles,
} from "../fixtures/system-bootstrap";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  setupUser,
  signInWithUser,
} from "../fixtures/user";

const logger = createLogger({ level: "info" });

let stopApi: () => void;

export async function setup() {
  try {
    // Start dapp api server
    const { stop } = await startApiServer();
    stopApi = stop;

    await setupUser(DEFAULT_ADMIN);

    // Parallelize user setup
    await Promise.all([setupUser(DEFAULT_INVESTOR), setupUser(DEFAULT_ISSUER)]);

    const orpClient = getOrpcClient(await signInWithUser(DEFAULT_ADMIN));
    const system = await bootstrapSystem(orpClient);

    // TODO: parallelize these operations when pincode concurrency issues are fixed
    await bootstrapTokenFactories(orpClient, system);
    await bootstrapAddons(orpClient);
    await setupDefaultIssuerRoles(orpClient);
    await setDefaultSystemSettings(orpClient);
    await createAndRegisterUserIdentities(orpClient);

    stopApi();
  } catch (error: unknown) {
    logger.error("Failed to setup test environment", error);
    process.exit(1);
  }
}

export const teardown = () => {
  stopApi?.();
};
