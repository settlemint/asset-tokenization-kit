import { createLogger } from "@settlemint/sdk-utils/logging";
import { startApiServer } from "../fixtures/dapp";
import { getOrpcClient } from "../fixtures/orpc-client";
import {
  bootstrapAddons,
  bootstrapSystem,
  bootstrapTokenFactories,
  createAndRegisterUserIdentities,
  issueDefaultKycClaims,
  setDefaultSystemSettings,
  setupDefaultAdminRoles,
  setupDefaultIssuerRoles,
  setupTrustedClaimIssuers,
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
    await bootstrapSystem(orpClient);

    await Promise.all([
      bootstrapTokenFactories(orpClient),
      bootstrapAddons(orpClient),
      (async () => {
        await setupDefaultAdminRoles(orpClient);
        await createAndRegisterUserIdentities(orpClient, [
          DEFAULT_ADMIN,
          DEFAULT_INVESTOR,
          DEFAULT_ISSUER,
        ]);
        await setupTrustedClaimIssuers(orpClient, DEFAULT_ISSUER);
        await issueDefaultKycClaims(orpClient, [
          DEFAULT_ADMIN,
          DEFAULT_INVESTOR,
          DEFAULT_ISSUER,
        ]);
      })(),
      setupDefaultIssuerRoles(orpClient, DEFAULT_ISSUER),
      setDefaultSystemSettings(orpClient),
    ]);

    stopApi();
  } catch (error: unknown) {
    logger.error("Failed to setup test environment", error);
    process.exit(1);
  }
}

export const teardown = () => {
  stopApi?.();
};
