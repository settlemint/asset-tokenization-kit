import type { introspection } from '@schemas/blockscout-env';
import { createBlockscoutClient } from '@settlemint/sdk-blockscout';

export const { client: blockscoutClient, graphql: blockscoutGraphql } = createBlockscoutClient<{
  introspection: introspection;
  disableMasking: true;
  scalars: {
    DateTime: Date;
    JSON: Record<string, unknown>;
    Bytes: string;
    Int8: string;
    BigInt: string;
    BigDecimal: string;
    Timestamp: string;
  };
}>({
  instance: process.env.SETTLEMINT_BLOCKSCOUT_ENDPOINT!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!, // undefined in browser, by design to not leak the secrets
});

export const blockscoutUiEndpoint = process.env.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT!;
