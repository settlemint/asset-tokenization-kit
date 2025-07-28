import type {
  AccessControl,
  AccessControlRoles,
} from "@/lib/fragments/the-graph/access-control-fragment";
import type { Context } from "@/orpc/context/context";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { z } from "zod";

/**
 * Middleware to check if the user has the required permission to interact with blockchain.
 * @param requiredRoles - The roles required to interact with blockchain.
 * @param getAccessControl - The function to get the access control from the input.
 * @returns The middleware function.
 */
export const blockchainPermissionsMiddleware = <InputSchema extends z.ZodType>({
  requiredRoles,
  getAccessControl,
}: {
  requiredRoles: AccessControlRoles[];
  getAccessControl: (data: {
    context: Context;
    input: z.infer<InputSchema>;
  }) => AccessControl | undefined;
}) =>
  baseRouter.middleware(async ({ context, next, errors }, input) => {
    const { auth, system } = context;

    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System context not set",
      });
    }

    const accessControl = getAccessControl({
      context,
      input: input as z.infer<InputSchema>,
    });

    if (!accessControl) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Access control not set",
      });
    }

    const userRoles = auth
      ? Object.entries(accessControl)
          .filter(([, accounts]) =>
            accounts.some(
              (account) => account.id === auth.user.wallet.toLowerCase()
            )
          )
          .map(([role]) => role as keyof typeof accessControl)
      : [];

    if (!userRoles.some((role) => requiredRoles.includes(role))) {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles,
        },
      });
    }

    return next();
  });
