import type { ResultOf } from '@settlemint/sdk-thegraph';
import { eq } from 'drizzle-orm';
import { type Address, getAddress } from 'viem';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schemas/settings';
import { AccessControlFragment } from '@/lib/fragments/the-graph/access-control-fragment';
import { theGraphClient, theGraphGraphql } from '@/lib/settlemint/the-graph';
import type { assetTypes } from '@/lib/zod/validators/asset-types';
import { baseRouter } from '@/orpc/procedures/base.router';

const SYSTEM_ADDRESS_KEY = 'SYSTEM_ADDRESS';

const TOKEN_FACTORIES_QUERY = theGraphGraphql(
  `
  query GetTokenFactories($systemAddress: ID!) {
    system(id: $systemAddress) {
      tokenFactoryRegistry {
        tokenFactories {
          id
          name
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
    ResultOf<typeof TOKEN_FACTORIES_QUERY>['system']
  >['tokenFactoryRegistry']
>['tokenFactories'][number]['accessControl'];

/**
 * Interface for a token factory.
 * @param type - The type of the token factory.
 * @param address - The address of the token factory.
 * @param accessControl - The access control of the token factory.
 */
export interface TokenFactory {
  type: (typeof assetTypes)[number];
  name: string;
  address: Address;
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
    const systemAddress = await getSystemAddress(db);
    if (!systemAddress) {
      throw errors.SYSTEM_NOT_CREATED();
    }
    const tokenFactories = await getTokenFactories(systemAddress);
    const systemContext: typeof context = {
      ...context,
      system: {
        address: systemAddress,
        tokenFactories,
      },
    };
    return next({
      context: systemContext,
    });
  }
);

const getSystemAddress = async (dbContext: typeof db) => {
  const [setting] = await dbContext
    .select()
    .from(settings)
    .where(eq(settings.key, SYSTEM_ADDRESS_KEY))
    .limit(1);

  if (setting?.value) {
    return getAddress(setting.value);
  }

  return null;
};

const getTokenFactories = async (
  systemAddress: Address
): Promise<TokenFactory[]> => {
  const { system } = await theGraphClient.request({
    document: TOKEN_FACTORIES_QUERY,
    variables: {
      systemAddress,
    },
  });
  return (
    system?.tokenFactoryRegistry?.tokenFactories.map(
      ({ id, name, accessControl }) => ({
        type: name as (typeof assetTypes)[number],
        name,
        address: getAddress(id),
        accessControl,
      })
    ) ?? []
  );
};
