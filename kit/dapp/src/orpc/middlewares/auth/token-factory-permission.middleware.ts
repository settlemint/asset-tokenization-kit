import type { AssetType } from "@/lib/zod/validators/asset-types";
import { getFactoryTypeIdFromAssetType } from "@/lib/zod/validators/asset-types";
import type { SystemAccessControl } from "@/orpc/middlewares/system/system.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { z } from "zod";

/**
 * Middleware to check if the user has the required permission to interact with the token factory.
 * @param requiredRoles - The roles required to interact with the token factory.
 * @param getTokenType - The function to get the token type from the input.
 * @returns The middleware function.
 */
export const tokenFactoryPermissionMiddleware = <
  InputSchema extends z.ZodType,
>({
  requiredRoles,
  getTokenType,
}: {
  requiredRoles: (keyof SystemAccessControl)[];
  getTokenType: (input: z.infer<InputSchema>) => AssetType;
}) =>
  baseRouter.middleware(async ({ context, next, errors }, input) => {
    const { auth, system } = context;

    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System context not set",
      });
    }

    const tokenType = getTokenType(input as z.infer<InputSchema>);
    const tokenFactory = system.tokenFactories.find(
      (tokenFactory) =>
        tokenFactory.typeId === getFactoryTypeIdFromAssetType(tokenType)
    );
    if (!tokenFactory) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token factory context not set",
      });
    }

    const userRoles = auth
      ? Object.entries(tokenFactory.accessControl)
          .filter(([, accounts]) =>
            accounts.some(
              (account) => account.id === auth.user.wallet.toLowerCase()
            )
          )
          .map(([role]) => role as keyof typeof tokenFactory.accessControl)
      : [];

    if (!userRoles.some((role) => requiredRoles.includes(role))) {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles,
        },
      });
    }

    return next({
      context: {
        tokenFactory,
      },
    });
  });
