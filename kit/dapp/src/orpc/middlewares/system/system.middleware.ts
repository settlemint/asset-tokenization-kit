import {
  AccessControlFragment,
  type AccessControl,
} from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { AssetFactoryTypeId } from "@/lib/zod/validators/asset-types";
import {
  getEthereumAddress,
  type EthereumAddress,
} from "@/lib/zod/validators/ethereum-address";
import { baseRouter } from "@/orpc/procedures/base.router";
import { read } from "@/orpc/routes/settings/routes/settings.read";
import { call } from "@orpc/server";

const SYSTEM_QUERY = theGraphGraphql(
  `
  query GetSystem($systemAddress: ID!) {
    system(id: $systemAddress) {
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
      }
    }
  }
`,
  [AccessControlFragment]
);

/**
 * Interface for a system component.
 * @param address - The address of the system component.
 * @param accessControl - The access control of the system component.
 */
interface SystemComponent {
  address: EthereumAddress;
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
 * Interface for the system context.
 * @param address - The address of the system.
 * @param accessControl - The access control of the system.
 * @param tokenFactories - The token factories of the system.
 */
export interface SystemContext {
  address: EthereumAddress;
  accessControl: AccessControl;
  tokenFactories: TokenFactory[];
  tokenFactoryRegistry?: SystemComponent;
  complianceModuleRegistry?: SystemComponent;
  identityRegistryStorage?: SystemComponent;
  identityRegistry?: SystemComponent;
  trustedIssuersRegistry?: SystemComponent;
  topicSchemeRegistry?: SystemComponent;
  systemAddonRegistry?: SystemComponent;
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
    const systemAddress = await call(
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
        message:
          "System not found, check if the address stored in the settings is correct",
      });
    }

    return next({
      context: {
        system: systemContext,
      },
    });
  }
);

const getSystemContext = async (
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
        address: getEthereumAddress(id),
        accessControl,
      })
    ) ?? [];
  return {
    address: systemAddress,
    accessControl: system?.accessControl,
    tokenFactories,
    tokenFactoryRegistry: system.tokenFactoryRegistry
      ? {
          address: getEthereumAddress(system.tokenFactoryRegistry?.id),
          accessControl: system?.tokenFactoryRegistry?.accessControl,
        }
      : undefined,
    complianceModuleRegistry: system.complianceModuleRegistry
      ? {
          address: getEthereumAddress(system.complianceModuleRegistry?.id),
          accessControl: system?.complianceModuleRegistry?.accessControl,
        }
      : undefined,
    identityRegistryStorage: system.identityRegistryStorage
      ? {
          address: getEthereumAddress(system.identityRegistryStorage?.id),
          accessControl: system?.identityRegistryStorage?.accessControl,
        }
      : undefined,
    identityRegistry: system.identityRegistry
      ? {
          address: getEthereumAddress(system.identityRegistry?.id),
          accessControl: system?.identityRegistry?.accessControl,
        }
      : undefined,
    trustedIssuersRegistry: system.trustedIssuersRegistry
      ? {
          address: getEthereumAddress(system.trustedIssuersRegistry?.id),
          accessControl: system?.trustedIssuersRegistry?.accessControl,
        }
      : undefined,
    topicSchemeRegistry: system.topicSchemeRegistry
      ? {
          address: getEthereumAddress(system.topicSchemeRegistry?.id),
          accessControl: system?.topicSchemeRegistry?.accessControl,
        }
      : undefined,
    systemAddonRegistry: system.systemAddonRegistry
      ? {
          address: getEthereumAddress(system.systemAddonRegistry?.id),
          accessControl: system?.systemAddonRegistry?.accessControl,
        }
      : undefined,
  };
};
