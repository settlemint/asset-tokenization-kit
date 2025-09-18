import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { isContractAddress } from "@/test/anvil";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import type { RoleRequirement } from "@atk/zod/role-requirement";
import { ORPCError } from "@orpc/server";
import { retryWhenFailed } from "@settlemint/sdk-utils";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { DEFAULT_INVESTOR } from "@test/fixtures/user";
import { getOrpcClient, type OrpcClient } from "./orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_ISSUER,
  DEFAULT_PINCODE,
  signInWithUser,
} from "./user";

const { userSearch: _, ...otherSystemRoles } = SYSTEM_PERMISSIONS;
const SYSTEM_MANAGEMENT_REQUIRED_ROLES = extractRequiredRoles(otherSystemRoles);

const logger = createLogger({ level: "info" });

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
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
  });

  if (!system?.id) {
    throw new Error("Failed to bootstrap system");
  }

  // System.create now grants all necessary roles including:
  // - DEFAULT_ADMIN_ROLE and SYSTEM_MANAGER_ROLE (granted by smart contract)
  // - TOKEN_MANAGER_ROLE, IDENTITY_MANAGER_ROLE, COMPLIANCE_MANAGER_ROLE, ADDON_MANAGER_ROLE (granted by API)
  logger.info("✓ System created with all necessary roles granted");

  // The create method already returns a fully initialized system
  if (!system.tokenFactoryRegistry) {
    throw new Error(
      "System created but not fully initialized - missing token factory registry"
    );
  }

  return system;
}

export async function bootstrapTokenFactories(orpClient: OrpcClient) {
  const tokenFactories = await orpClient.system.factory.list({});

  const factories: Parameters<
    typeof orpClient.system.factory.create
  >[0]["factories"] = [
    { type: "bond", name: "Bonds" },
    { type: "deposit", name: "Deposits" },
    { type: "equity", name: "Equities" },
    { type: "fund", name: "Funds" },
    { type: "stablecoin", name: "Stablecoins" },
  ];

  const nonExistingFactories = factories.filter(
    (factory) => !tokenFactories.some((t) => t.name === factory.name)
  );

  if (nonExistingFactories.length === 0) {
    logger.info("All token factories already exist");
    return;
  }

  const initialFactoryCount = tokenFactories.length;

  const result = await orpClient.system.factory.create({
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    factories: nonExistingFactories,
  });

  // The factoryCreate method now returns the updated system details
  if (!result.id || !result.tokenFactoryRegistry?.tokenFactories) {
    throw new Error(`Factory creation failed: invalid response`);
  }

  const finalFactoryCount = result.tokenFactoryRegistry.tokenFactories.length;
  const successfulCreations = finalFactoryCount - initialFactoryCount;

  if (successfulCreations !== nonExistingFactories.length) {
    throw new Error(
      `Token factories attempted: ${nonExistingFactories.length}, succeeded: ${successfulCreations}`
    );
  }
  logger.info("Token factories created", {
    created: result.tokenFactoryRegistry.tokenFactories.map((f) => {
      return {
        typeId: f.typeId,
        address: f.id,
        name: f.name,
      };
    }),
    existing: tokenFactories.map((f) => {
      return {
        typeId: f.typeId,
        address: f.id,
        name: f.name,
      };
    }),
  });

  const allTokenFactories = await orpClient.system.factory.list({});
  for (const factory of allTokenFactories) {
    const { id: address, typeId, name } = factory;
    const isContract = await isContractAddress(address);
    if (!isContract) {
      logger.info(
        `Token factory ${name} (${typeId}) at ${address} is not a contract`
      );
    } else {
      logger.info(
        `Token factory ${name} (${typeId}) at ${address} is a contract`
      );
    }
  }
}

export async function bootstrapAddons(orpClient: OrpcClient) {
  const addons = await orpClient.system.addon.list({});
  if (addons.length > 0) {
    logger.info("Addons already exist");
    return;
  }

  await orpClient.system.addon.create({
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    addons: [
      {
        type: "airdrops",
        name: "Airdrops",
      },
      {
        type: "yield",
        name: "Yield",
      },
      {
        type: "xvp",
        name: "XvP",
      },
    ],
  });
}

export async function setupDefaultIssuerRoles(orpClient: OrpcClient) {
  const issuerOrpcClient = getOrpcClient(await signInWithUser(DEFAULT_ISSUER));
  const issuerSystem = await issuerOrpcClient.system.read({ id: "default" });

  // Issuer needs both token management roles and the claimIssuer role
  const issuerRequiredRoles: AccessControlRoles[] = [
    "tokenManager",
    "claimIssuer", // Required for issuing claims to user identities
  ];

  const rolesToGrant = issuerRequiredRoles.filter(
    (role) => issuerSystem.userPermissions?.roles[role] !== true
  );

  if (rolesToGrant.length > 0) {
    logger.info("Granting on-chain roles to issuer", { roles: rolesToGrant });
    await orpClient.system.accessManager.grantRole({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      address: (await issuerOrpcClient.user.me({})).wallet ?? "",
      role: rolesToGrant as AccessControlRoles[],
    });
  }
}

export async function setupDefaultAdminRoles(orpClient: OrpcClient) {
  const adminSystem = await orpClient.system.read({ id: "default" });

  const rolesToGrant = SYSTEM_MANAGEMENT_REQUIRED_ROLES.filter(
    (role) => adminSystem.userPermissions?.roles[role] !== true
  );

  if (rolesToGrant.length > 0) {
    logger.info("Granting roles to admin", { roles: rolesToGrant });
    await orpClient.system.accessManager.grantRole({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      address: (await orpClient.user.me({})).wallet ?? "",
      role: rolesToGrant,
    });
  }
}

export async function setupTrustedClaimIssuers(orpClient: OrpcClient) {
  const topics = await orpClient.system.claimTopics.topicList({});
  const trustedIssuers = await orpClient.system.trustedIssuers.list({});
  const adminIdentity = await orpClient.system.identity.me({});
  if (!trustedIssuers.some((t) => t.id === adminIdentity?.id)) {
    logger.info("Making admin a trusted issuer of all topics");
    // Make admin a trusted issuer of all topics
    await orpClient.system.trustedIssuers.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      issuerAddress: adminIdentity?.id ?? "",
      claimTopicIds: topics.map((t) => t.topicId),
    });
  }
  const issuerOrpcClient = getOrpcClient(await signInWithUser(DEFAULT_ISSUER));
  const issuerIdentity = await issuerOrpcClient.system.identity.me({});
  if (!trustedIssuers.some((t) => t.id === issuerIdentity?.id)) {
    logger.info("Making issuer a trusted issuer of asset related topics");
    // Make issuer a trusted issuer of asset related topics
    await orpClient.system.trustedIssuers.create({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      issuerAddress: issuerIdentity?.id ?? "",
      claimTopicIds: topics
        .filter((topic) =>
          ["collateral", "assetClassification", "basePrice", "isin"].includes(
            topic.name
          )
        )
        .map((t) => t.topicId),
    });
  }
}

export async function setDefaultSystemSettings(orpClient: OrpcClient) {
  const settings = await orpClient.settings.list({});
  if (settings.find((s) => s.key === "BASE_CURRENCY")) {
    logger.info("Base currency already set");
    return;
  }
  await orpClient.settings.upsert({
    key: "BASE_CURRENCY",
    value: "USD",
  });
}

export async function createAndRegisterUserIdentities(orpcClient: OrpcClient) {
  const users = [DEFAULT_ISSUER, DEFAULT_INVESTOR, DEFAULT_ADMIN];

  await Promise.all(
    users.map(async (user) => {
      const userOrpClient = getOrpcClient(await signInWithUser(user));
      const me = await userOrpClient.user.me({});
      if (me.wallet && !me.onboardingState.identitySetup) {
        await orpcClient.system.identity.create({
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          wallet: me.wallet,
        });
        try {
          await orpcClient.system.identity.register({
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
            wallet: me.wallet,
            country: "BE",
          });
        } catch (err) {
          if (
            !(
              err instanceof ORPCError &&
              err.message.includes("IdentityAlreadyRegistered")
            )
          ) {
            throw err;
          }
        }
      }
      if (!me.onboardingState.identity) {
        await orpcClient.user.kyc.upsert({
          firstName: user.name,
          lastName: "(Integration tests)",
          dob: new Date("1990-01-01"),
          country: "BE",
          residencyStatus: "resident",
          nationalId: "1234567890",
          userId: me.id,
        });
      }
    })
  );
}

function extractRequiredRoles(permissions: Record<string, RoleRequirement>) {
  return Object.entries(permissions).reduce((acc, [, requiredRoles]) => {
    const roles = getRoles([requiredRoles]);
    roles.forEach((role) => {
      if (!acc.includes(role)) {
        acc.push(role);
      }
    });
    return acc;
  }, [] as AccessControlRoles[]);
}

function getRoles(requirements: RoleRequirement[], depth = 0) {
  const roles: AccessControlRoles[] = [];
  if (depth > 10) {
    return [];
  }
  for (const requirement of requirements) {
    if (typeof requirement === "string") {
      roles.push(requirement);
    } else if ("any" in requirement) {
      roles.push(...getRoles(requirement.any, depth + 1));
    } else if ("all" in requirement) {
      roles.push(...getRoles(requirement.all, depth + 1));
    }
  }

  return roles;
}
