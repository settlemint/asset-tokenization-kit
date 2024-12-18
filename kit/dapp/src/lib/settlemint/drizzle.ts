import { createDrizzleClient } from '@settlemint/sdk-hasura/drizzle';

let cachedDrizzleClient: ReturnType<typeof createDrizzleClient> | undefined;

export const drizzleClient = (schemas: Record<string, unknown>) => {
  if (!cachedDrizzleClient) {
    cachedDrizzleClient = createDrizzleClient({
      databaseUrl: process.env.SETTLEMINT_HASURA_DATABASE_URL ?? '',
      schemas,
    });
  }
  return cachedDrizzleClient;
};
