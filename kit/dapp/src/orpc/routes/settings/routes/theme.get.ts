import { getTheme } from "@/components/theme/lib/repository";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";

/**
 * Theme get route handler.
 *
 * Retrieves the current theme configuration from the database.
 * Falls back to default theme if none exists.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission for settings
 * Method: GET /settings/theme
 */
export const get = authRouter.settings.theme.get
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["read"] },
    })
  )
  .handler(async () => {
    return getTheme();
  });
