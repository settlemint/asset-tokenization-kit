import { getDappUrl } from "../fixtures/dapp";
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

export async function setup() {
  try {
    // Wait for containerized dapp to be ready
    await waitForDapp();

    console.log("Setting up admin account");
    await setupUser(DEFAULT_ADMIN);
    console.log("Setting up investor account");
    await setupUser(DEFAULT_INVESTOR);
    console.log("Setting up issuer account");
    await setupUser(DEFAULT_ISSUER);

    const orpClient = getOrpcClient(await signInWithUser(DEFAULT_ADMIN));
    console.log("Bootstrapping system");
    const system = await bootstrapSystem(orpClient);
    console.log("Bootstrapping token factories");
    await bootstrapTokenFactories(orpClient, system);
    console.log("Granting roles to default accounts");
    await setupDefaultIssuerRoles(orpClient);
  } catch (error: unknown) {
    console.error("Failed to setup test environment", error);
    process.exit(1);
  }
}

export const teardown = () => {
  // Nothing to teardown as containers are managed by docker-compose
};

async function waitForDapp() {
  console.log("Waiting for containerized dapp to be ready...");
  const maxAttempts = 60; // 60 seconds timeout
  const delayMs = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(getDappUrl());
      if (response.ok) {
        console.log("Containerized dapp is ready!");
        return;
      }
    } catch {
      // Ignore connection errors
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Containerized dapp did not become ready in time");
}
