import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { AssetFactoryTypeId } from "@/lib/zod/validators/asset-types";
import {
  getEthereumAddress,
  type EthereumAddress,
} from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { ResultOf } from "@settlemint/sdk-thegraph";

const TOKEN_FACTORIES_QUERY = theGraphGraphql(
  `
  query GetTokenFactories($systemAddress: ID!) {
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
    }
  }
`,
  [AccessControlFragment]
);

/**
 * Interface for the access control of a token factory.
 */
export type SystemAccessControl = NonNullable<
  NonNullable<
    ResultOf<typeof TOKEN_FACTORIES_QUERY>["system"]
  >["tokenFactoryRegistry"]
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
 * Middleware to inject the system context into the request context.
 * @returns The middleware function.
 */
export const systemMiddleware = baseRouter.middleware(
  async ({ context, next, errors }) => {
    if (context.system) {
      return next();
    }
    const systemAddress = await orpc.settings.read.call({
      key: "SYSTEM_ADDRESS" as const,
    });
    if (!systemAddress) {
      throw errors.SYSTEM_NOT_CREATED();
    }
    const tokenFactories = await getTokenFactories(
      getEthereumAddress(systemAddress)
    );
    const systemContext: typeof context = {
      ...context,
      system: {
        address: getEthereumAddress(systemAddress),
        tokenFactories,
      },
    };
    return next({
      context: systemContext,
    });
  }
);

const getTokenFactories = async (
  systemAddress: EthereumAddress
): Promise<TokenFactory[]> => {
  const { system } = await theGraphClient.request({
    document: TOKEN_FACTORIES_QUERY,
    variables: {
      systemAddress,
    },
  });
  return (
    system?.tokenFactoryRegistry?.tokenFactories.map(
      ({ id, name, typeId, accessControl }) => ({
        name,
        typeId: typeId as AssetFactoryTypeId,
        address: getEthereumAddress(id),
        accessControl,
      })
    ) ?? []
  );
};
