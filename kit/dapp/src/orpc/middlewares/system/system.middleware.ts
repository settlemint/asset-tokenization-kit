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
import {
  getComponentId,
  parseSystemComponent,
} from "@/orpc/helpers/system-component-helpers";
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
      systemAccessManager {
        id
        accessControl {
          ...AccessControlFragment
        }
      }
      tokenFactoryRegistry {
        id
        tokenFactories {
          id
          name
          typeId
        }
      }
      complianceModuleRegistry {
        id
        complianceModules {
          id
          typeId
          name
        }
      }
      identityFactory {
        id
      }
      identityRegistryStorage {
        id
      }
      identityRegistry {
        id
      }
      trustedIssuersRegistry {
        id
      }
      topicSchemeRegistry {
        id
      }
      systemAddonRegistry {
        id
        systemAddons {
          id
          name
          typeId
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
  accessControl?: AccessControl;
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
  systemAccessManager: SystemComponent | null;
  complianceModuleRegistry: EthereumAddress | null;
  complianceModules: SystemComplianceModule[];
  identityFactory: EthereumAddress | null;
  identityRegistry: EthereumAddress | null;
  identityRegistryStorage: EthereumAddress | null;
  systemAddonRegistry: EthereumAddress | null;
  systemAddons: SystemAddon[];
  tokenFactories: TokenFactory[];
  tokenFactoryRegistry: EthereumAddress | null;
  topicSchemeRegistry: EthereumAddress | null;
  trustedIssuersRegistry: EthereumAddress | null;
}

/**
 * Middleware to inject the system context into the request context.
 * @returns The middleware function.
 */
export const systemMiddleware = baseRouter.middleware(
  async ({ context, next, errors }) => {
    // Always fetch fresh system data - no caching
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
    system.tokenFactoryRegistry?.tokenFactories.map(({ id, name, typeId }) => ({
      name,
      typeId: typeId as AssetFactoryTypeId,
      id: getEthereumAddress(id),
    })) ?? [];
  const systemAddons =
    system.systemAddonRegistry?.systemAddons.map(({ id, name, typeId }) => ({
      name,
      typeId: typeId as AddonFactoryTypeId,
      id: getEthereumAddress(id),
    })) ?? [];
  const complianceModules =
    system.complianceModuleRegistry?.complianceModules.map(
      ({ id, typeId, name }) => ({
        id: getEthereumAddress(id),
        typeId: typeId as ComplianceTypeId,
        name,
      })
    ) ?? [];

  return {
    address: systemAddress,
    deployedInTransaction: system.deployedInTransaction as Hex,
    tokenFactories,
    systemAddons,
    complianceModules,
    systemAccessManager: parseSystemComponent(system.systemAccessManager),
    identityFactory: getComponentId(system.identityFactory),
    tokenFactoryRegistry: getComponentId(system.tokenFactoryRegistry),
    complianceModuleRegistry: getComponentId(system.complianceModuleRegistry),
    identityRegistryStorage: getComponentId(system.identityRegistryStorage),
    identityRegistry: getComponentId(system.identityRegistry),
    trustedIssuersRegistry: getComponentId(system.trustedIssuersRegistry),
    topicSchemeRegistry: getComponentId(system.topicSchemeRegistry),
    systemAddonRegistry: getComponentId(system.systemAddonRegistry),
  };
};
