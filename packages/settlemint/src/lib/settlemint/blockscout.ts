import type { introspection } from "@schemas/blockscout-env";
import { createBlockscoutClient } from "@settlemint/sdk-blockscout";
import { createLogger, type LogLevel, requestLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger({ level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel });

// Validate required environment variables
const blockscoutEndpoint = process.env.SETTLEMINT_BLOCKSCOUT_ENDPOINT;
const blockscoutUiEndpointVar = process.env.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT;

if (!blockscoutEndpoint) {
  throw new Error("SETTLEMINT_BLOCKSCOUT_ENDPOINT environment variable is required");
}

if (!blockscoutUiEndpointVar) {
  throw new Error("SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT environment variable is required");
}

export const { client: blockscoutClient, graphql: blockscoutGraphql } = createBlockscoutClient<{
  introspection: introspection;
  disableMasking: true;
  scalars: {
    /** 40 hex characters (160 bits/20 bytes) derived from the public key, prefixed with 0x */
    AddressHash: string;
    /** Unpadded big-endian hexadecimal number where each byte pair maps to underlying binary */
    Data: string;
    /** ISO8601 formatted UTC datetime string */
    DateTime: string;
    /** String representation of a signed double-precision decimal value */
    Decimal: string;
    /** 32-byte KECCAK-256 hash */
    FullHash: string;
    /** Arbitrary JSON string data as UTF-8 */
    Json: string;
    /** 16 hex character (128 bits/8 bytes) nonce from Proof-of-Work */
    NonceHash: string;
    /** Smallest fractional unit of Ether, represented as a string for integer math */
    Wei: string;
  };
}>(
  {
    instance: blockscoutEndpoint,
    accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
  },
  {
    fetch: requestLogger(logger, "blockscout", fetch) as typeof fetch,
  }
);

export const blockscoutUiEndpoint = blockscoutUiEndpointVar;
