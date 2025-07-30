import {
  AccessControlFragment,
  type AccessControl,
} from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { AddonFactoryTypeId } from "@/lib/zod/validators/addon-types";
import type { AssetFactoryTypeId } from "@/lib/zod/validators/asset-types";
import { ComplianceTypeId } from "@/lib/zod/validators/compliance";
import {
  getEthereumAddress,
  type EthereumAddress,
} from "@/lib/zod/validators/ethereum-address";
import { baseRouter } from "@/orpc/procedures/base.router";
import { read } from "@/orpc/routes/settings/routes/settings.read";
import { call } from "@orpc/server";
import type { Hex } from "viem";

const SYSTEM_QUERY = theGraphGraphql(
  `
  query GetSystem($systemAddress: ID!) {
    system(id: $systemAddress) {
      id
      deployedInTransaction
      accessControl {
        ...AccessControlFragment
      }
      tokenFactoryRegistry {
        id
        accessControl {
          ...AccessControlFragment
        }
        tokenFactories {
          id
          name
          typeId
          accessControl {
            ...AccessControlFragment
          }
        }
      }
      complianceModuleRegistry {
        id
        accessControl {
          ...AccessControlFragment
        }
        complianceModules {
          id
          typeId
          name
          accessControl {
            ...AccessControlFragment
          }
        }
      }
      identityFactory {
        id
      }
      identityRegistryStorage {
        id
        accessControl {
          ...AccessControlFragment
        }
      }
      identityRegistry {
        id
        accessControl {
          ...AccessControlFragment
        }
      }
      trustedIssuersRegistry {
        id
        accessControl {
          ...AccessControlFragment
        }
      }
      topicSchemeRegistry {
        id
        accessControl {
          ...AccessControlFragment
        }
      }
      systemAddonRegistry {
        id
        accessControl {
          ...AccessControlFragment
        }
        systemAddons {
          id
          name
          typeId
          accessControl {
            ...AccessControlFragment
          }
        }
      }
    }
  }
`,
  [AccessControlFragment]
);

/**
 * Interface for a system component.
 * @param id - The address of the system component.
 * @param accessControl - The access control of the system component.
 */
interface SystemComponent {
  id: EthereumAddress;
  accessControl: AccessControl;
}

/**
 * Interface for a token factory.
 * @param type - The type of the token factory.
 * @param address - The address of the token factory.
 * @param accessControl - The access control of the token factory.
 */
interface TokenFactory extends SystemComponent {
  name: string;
  typeId: AssetFactoryTypeId;
}

/**
 * Interface for a system addon.
 * @param id - The id of the system addon.
 * @param typeId - The type of the system addon.
 * @param name - The name of the system addon.
 */
export interface SystemAddon extends SystemComponent {
  name: string;
  typeId: AddonFactoryTypeId;
}

/**
 * Interface for a compliance module.
 * @param id - The id of the compliance module.
 * @param typeId - The type of the compliance module.
 * @param name - The name of the compliance module.
 */
export interface SystemComplianceModule extends SystemComponent {
  name: string;
  typeId: ComplianceTypeId;
}

/**
 * Interface for the system context.
 * @param address - The address of the system.
 * @param accessControl - The access control of the system.
 * @param tokenFactories - The token factories of the system.
 */
export interface SystemContext {
  address: EthereumAddress;
  deployedInTransaction: Hex;
  accessControl: AccessControl;
  complianceModuleRegistry: SystemComponent | null;
  complianceModules: SystemComplianceModule[];
  identityFactory: Pick<SystemComponent, "id"> | null;
  identityRegistry: SystemComponent | null;
  identityRegistryStorage: SystemComponent | null;
  systemAddonRegistry: SystemComponent | null;
  systemAddons: SystemAddon[];
  tokenFactories: TokenFactory[];
  tokenFactoryRegistry: SystemComponent | null;
  topicSchemeRegistry: SystemComponent | null;
  trustedIssuersRegistry: SystemComponent | null;
}

/**
 * Middleware to inject the system context into the request context.
 * @returns The middleware function.
 */
export const systemMiddleware = baseRouter.middleware(
  async ({ context, next, errors }) => {
    if (context.system) {
      return next({
        context: {
          system: context.system,
        },
      });
    }
    const systemAddressHeader = context.headers["x-system-address"];
    const systemAddress =
      typeof systemAddressHeader === "string"
        ? systemAddressHeader
        : await call(
            read,
            {
              key: "SYSTEM_ADDRESS" as const,
            },
            {
              context,
            }
          );
    if (!systemAddress) {
      throw errors.SYSTEM_NOT_CREATED();
    }
    const systemContext = await getSystemContext(
      getEthereumAddress(systemAddress)
    );

    if (!systemContext) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: `System with address '${systemAddress}' not found`,
      });
    }

    return next({
      context: {
        system: systemContext,
      },
    });
  }
);

export const getSystemContext = async (
  systemAddress: EthereumAddress
): Promise<SystemContext | null> => {
  const { system } = await theGraphClient.request({
    document: SYSTEM_QUERY,
    variables: {
      systemAddress,
    },
  });
  if (!system) {
    return null;
  }
  const tokenFactories =
    system.tokenFactoryRegistry?.tokenFactories.map(
      ({ id, name, typeId, accessControl }) => ({
        name,
        typeId: typeId as AssetFactoryTypeId,
        id: getEthereumAddress(id),
        accessControl,
      })
    ) ?? [];
  const systemAddons =
    system.systemAddonRegistry?.systemAddons.map(
      ({ id, name, typeId, accessControl }): SystemAddon => ({
        name,
        typeId: typeId as AddonFactoryTypeId,
        id: getEthereumAddress(id),
        accessControl,
      })
    ) ?? [];
  const complianceModules =
    system.complianceModuleRegistry?.complianceModules.map(
      ({ id, typeId, name, accessControl }) => ({
        id: getEthereumAddress(id),
        typeId: typeId as ComplianceTypeId,
        name,
        accessControl,
      })
    ) ?? [];
  return {
    address: systemAddress,
    deployedInTransaction: system.deployedInTransaction as Hex,
    accessControl: system?.accessControl,
    tokenFactories,
    systemAddons,
    complianceModules,
    identityFactory: system.identityFactory
      ? {
          id: getEthereumAddress(system.identityFactory?.id),
        }
      : null,
    tokenFactoryRegistry: system.tokenFactoryRegistry
      ? {
          id: getEthereumAddress(system.tokenFactoryRegistry?.id),
          accessControl: system?.tokenFactoryRegistry?.accessControl,
        }
      : null,
    complianceModuleRegistry: system.complianceModuleRegistry
      ? {
          id: getEthereumAddress(system.complianceModuleRegistry?.id),
          accessControl: system?.complianceModuleRegistry?.accessControl,
        }
      : null,
    identityRegistryStorage: system.identityRegistryStorage
      ? {
          id: getEthereumAddress(system.identityRegistryStorage?.id),
          accessControl: system?.identityRegistryStorage?.accessControl,
        }
      : null,
    identityRegistry: system.identityRegistry
      ? {
          id: getEthereumAddress(system.identityRegistry?.id),
          accessControl: system?.identityRegistry?.accessControl,
        }
      : null,
    trustedIssuersRegistry: system.trustedIssuersRegistry
      ? {
          id: getEthereumAddress(system.trustedIssuersRegistry?.id),
          accessControl: system?.trustedIssuersRegistry?.accessControl,
        }
      : null,
    topicSchemeRegistry: system.topicSchemeRegistry
      ? {
          id: getEthereumAddress(system.topicSchemeRegistry?.id),
          accessControl: system?.topicSchemeRegistry?.accessControl,
        }
      : null,
    systemAddonRegistry: system.systemAddonRegistry
      ? {
          id: getEthereumAddress(system.systemAddonRegistry?.id),
          accessControl: system?.systemAddonRegistry?.accessControl,
        }
      : null,
  };
};
