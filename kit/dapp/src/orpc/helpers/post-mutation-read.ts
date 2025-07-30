import type { Context } from "@/orpc/context/context";
import { read as tokenRead } from "@/orpc/routes/token/routes/token.read";
import { call } from "@orpc/server";

/**
 * Helper function to read token data after a mutation.
 * This consolidates the common pattern of returning updated token data
 * after performing a mutation operation.
 *
 * @param tokenAddress - The address of the token to read
 * @param context - The ORPC context containing auth and middleware data
 * @returns The updated token data
 */
export async function readTokenAfterMutation(
  tokenAddress: string,
  context: Context
) {
  return await call(
    tokenRead,
    {
      tokenAddress,
    },
    {
      context,
    }
  );
}
