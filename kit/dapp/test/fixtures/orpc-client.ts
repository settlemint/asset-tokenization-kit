import {
  CUSTOM_ERRORS,
  type CUSTOM_ERROR_CODES,
} from "@/orpc/procedures/base.contract";
import type { router } from "@/orpc/routes/router";
import { bigDecimalSerializer } from "@atk/zod/bigdecimal";
import { bigIntSerializer } from "@atk/zod/bigint";
import { timestampSerializer } from "@atk/zod/timestamp";
import { createORPCClient, onError, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { getDappUrl } from "./dapp";

export type OrpcClient = RouterClient<typeof router>;

const logger = createLogger();

/**
 * Creates an ORPC client for testing with error logging suppression.
 *
 * @param headers Authentication headers from signInWithUser
 */
export interface TestClientContext {
  skipLoggingFor?: CUSTOM_ERROR_CODES[];
}

export const getOrpcClient = (
  headers: Headers
): RouterClient<typeof router, TestClientContext> => {
  const link = new RPCLink<TestClientContext>({
    url: `${getDappUrl()}/api/rpc`,
    headers: () => ({
      cookie: headers.get("Cookie") as string,
    }),
    customJsonSerializers: [
      bigDecimalSerializer,
      bigIntSerializer,
      timestampSerializer,
    ],
    interceptors: [
      onError((error: unknown, options) => {
        if (error instanceof ORPCError) {
          const errorCode = error.code;

          const expectedErrors = options.context?.skipLoggingFor ?? [];
          if (expectedErrors?.includes(errorCode)) {
            return;
          }

          logger.error(`ORPC error details:`, {
            message: error?.message,
            code: error?.code,
            status: error?.status,
            data: error?.data,
            cause: error?.cause,
            stack: error?.stack,
          });
        }
      }),
    ],
    // fetch: <-- provide fetch polyfill fetch if needed
  });
  return createORPCClient(link);
};

export const errorMessageForCode = (code: CUSTOM_ERROR_CODES) => {
  return CUSTOM_ERRORS[code].message;
};
