import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { AssetFactoryTypeId } from "@/lib/zod/validators/asset-types";
import {
  getEthereumAddress,
  type EthereumAddress,
} from "@/lib/zod/validators/ethereum-address";
import { baseRouter } from "@/orpc/procedures/base.router";
import { read } from "@/orpc/routes/settings/routes/settings.read";
import { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import { call } from "@orpc/server";
import type { ResultOf } from "@settlemint/sdk-thegraph";

const SYSTEM_QUERY = theGraphGraphql(
  `
  query GetSystem($systemAddress: ID!) {
    system(id: $systemAddress) {
      tokenFactoryRegistry {
        tokenFactories {
          id
          name
          typeId
          accessControl {
            ...AccessControlFragment
          }
        }
      }
      systemAddonRegistry {
        systemAddons(orderBy: name) {
          id
          typeId
          name
        }
      }
    }
  }
`,
  [AccessControlFragment]
);

/**
 * Interface for the access control of a token factory.
 */
export type SystemAccessControl = NonNullable<
  NonNullable<ResultOf<typeof SYSTEM_QUERY>["system"]>["tokenFactoryRegistry"]
>["tokenFactories"][number]["accessControl"];

/**
 * Interface for a token factory.
 * @param type - The type of the token factory.
 * @param address - The address of the token factory.
 * @param accessControl - The access control of the token factory.
 */
export interface TokenFactory {
  name: string;
  typeId: AssetFactoryTypeId;
  address: EthereumAddress;
  accessControl: SystemAccessControl;
}

/**
 * Interface for a system addon.
 * @param id - The id of the system addon.
 * @param typeId - The type of the system addon.
 * @param name - The name of the system addon.
 */
export interface SystemAddon {
  address: EthereumAddress;
  typeId: SystemAddonType;
  name: string;
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
    const { tokenFactories, systemAddons } = await getSystem(
      getEthereumAddress(systemAddress)
    );

    return next({
      context: {
        system: {
          address: getEthereumAddress(systemAddress),
          tokenFactories,
          addons: systemAddons,
        },
      },
    });
  }
);

const getSystem = async (
  systemAddress: EthereumAddress
): Promise<{
  tokenFactories: TokenFactory[];
  systemAddons: SystemAddon[];
}> => {
  const { system } = await theGraphClient.request({
    document: SYSTEM_QUERY,
    variables: {
      systemAddress,
    },
  });
  return {
    tokenFactories:
      system?.tokenFactoryRegistry?.tokenFactories.map(
        ({ id, name, typeId, accessControl }) => ({
          name,
          typeId: typeId as AssetFactoryTypeId,
          address: getEthereumAddress(id),
          accessControl,
        })
      ) ?? [],
    systemAddons:
      system?.systemAddonRegistry?.systemAddons.map(({ id, typeId, name }) => ({
        address: getEthereumAddress(id),
        typeId: typeId as SystemAddonType,
        name,
      })) ?? [],
  };
};
