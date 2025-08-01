import { retryWhenFailed } from "@settlemint/sdk-utils";
import { OrpcClient } from "./orpc-client";
import { DEFAULT_PINCODE } from "./user";

export async function bootstrapSystem(orpClient: OrpcClient) {
  const systems = await orpClient.system.list({});
  if (systems.length > 0) {
    const firstSystem = systems[0];
    if (!firstSystem) {
      throw new Error("No system found in list");
    }
    const systemId = firstSystem.id;
    // For existing system, fetch and verify it's fully initialized
    const system = await orpClient.system.read({ id: systemId });
    if (!system.tokenFactoryRegistry) {
      // Wait for system to be fully initialized
      await retryWhenFailed(
        async () => {
          const sys = await orpClient.system.read({ id: systemId });
          if (!sys.tokenFactoryRegistry) {
            throw new Error("System not yet fully initialized");
          }
          return sys;
        },
        5, // max retries
        2000 // wait 2 seconds between retries
      );
    }
    return system;
  }

  // Create new system - system.create returns the complete system object
  const system = await orpClient.system.create({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
  });

  if (!system?.id) {
    throw new Error("Failed to bootstrap system");
  }

  // No need to grant permissions anymore as it's already done in the Ignition module
  console.log("✓ Permissions already granted during system bootstrap");

  // The create method already returns a fully initialized system
  if (!system.tokenFactoryRegistry) {
    throw new Error(
      "System created but not fully initialized - missing token factory registry"
    );
  }

  return system;
}

export async function bootstrapTokenFactories(
  orpClient: OrpcClient,
  system: {
    id: string;
    tokenFactoryRegistry: string | null;
    identityRegistry?: string | null;
    compliance?: string | null;
  }
) {
  if (!system.tokenFactoryRegistry) {
    console.log("System registries not yet initialized:", {
      identityRegistry: system.identityRegistry,
      tokenFactoryRegistry: system.tokenFactoryRegistry,
      compliance: system.compliance,
    });
    throw new Error(
      "System not fully initialized - token factory registry not found"
    );
  }

  const tokenFactories = await orpClient.token.factoryList({});

  const factories: Parameters<
    typeof orpClient.token.factoryCreate
  >[0]["factories"] = [
    { type: "bond", name: "Bond Factory" },
    { type: "deposit", name: "Deposit Factory" },
    { type: "equity", name: "Equrity Factory" },
    { type: "fund", name: "Fund Factory" },
    { type: "stablecoin", name: "Stablecoin Factory" },
  ];

  const nonExistingFactories = factories.filter(
    (factory) => !tokenFactories.some((t) => t.name === factory.name)
  );

  if (nonExistingFactories.length === 0) {
    console.log("All token factories already exist");
    return;
  }

  const result = await orpClient.token.factoryCreate({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
    factories: nonExistingFactories,
  });

  // The factoryCreate method returns a FactoryCreateOutput with status and results
  if (result.status !== "completed") {
    throw new Error(`Factory creation failed: ${result.message}`);
  }

  const transactionHashes: string[] = [];

  if (result.results) {
    result.results.forEach((r) => {
      if (r.transactionHash) {
        transactionHashes.push(r.transactionHash);
      }
    });
  }

  const successfulCreations =
    result.results?.filter((r) => !r.error).length || 0;
  if (successfulCreations !== nonExistingFactories.length) {
    throw new Error(
      `Token factories attempted: ${nonExistingFactories.length}, succeeded: ${successfulCreations}`
    );
  }
  console.log("Token factories created");
}
