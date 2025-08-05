import { retryWhenFailed } from "@settlemint/sdk-utils";
import { OrpcClient } from "./orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_ISSUER,
  DEFAULT_PINCODE,
  getUserData,
} from "./user";

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
        10, // max retries
        1000 // wait 1 second between retries
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

  // System.create now grants all necessary roles including:
  // - DEFAULT_ADMIN_ROLE and SYSTEM_MANAGER_ROLE (granted by smart contract)
  // - TOKEN_MANAGER_ROLE, IDENTITY_MANAGER_ROLE, COMPLIANCE_MANAGER_ROLE, ADDON_MANAGER_ROLE (granted by API)
  console.log("✓ System created with all necessary roles granted");

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

  const tokenFactories = await orpClient.system.tokenFactoryList({});

  const factories: Parameters<
    typeof orpClient.system.tokenFactoryCreate
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

  const initialFactoryCount = tokenFactories.length;

  const result = await orpClient.system.tokenFactoryCreate({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
    factories: nonExistingFactories,
  });

  console.error(result);

  // The factoryCreate method now returns the updated system details
  if (!result.id || !result.tokenFactories) {
    throw new Error(`Factory creation failed: invalid response`);
  }

  const finalFactoryCount = result.tokenFactories.length;
  const successfulCreations = finalFactoryCount - initialFactoryCount;

  if (successfulCreations !== nonExistingFactories.length) {
    throw new Error(
      `Token factories attempted: ${nonExistingFactories.length}, succeeded: ${successfulCreations}`
    );
  }
  console.log("Token factories created");
}

export async function setupDefaultAccountRoles(orpClient: OrpcClient) {
  const admin = await getUserData(DEFAULT_ADMIN);
  console.log("Granting identity manager role to admin");
  await orpClient.system.grantRole({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
    accounts: [admin.wallet],
    role: "identityManager",
  });
  const issuer = await getUserData(DEFAULT_ISSUER);
  console.log("Granting token manager role to issuer");
  await orpClient.system.grantRole({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
    accounts: [issuer.wallet],
    role: "tokenManager",
  });
  console.log("Granting compliance manager role to issuer");
  await orpClient.system.grantRole({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
    accounts: [issuer.wallet],
    role: "complianceManager",
  });
}
