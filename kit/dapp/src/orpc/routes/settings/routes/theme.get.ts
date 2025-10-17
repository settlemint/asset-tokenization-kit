import { getTheme } from "@/components/theme/lib/repository";
import { publicRouter } from "@/orpc/procedures/public.router";

/**
 * Theme get route handler.
 *
 * Retrieves the current theme configuration from the database.
 * Falls back to default theme if none exists.
 *
 * Authentication: Not required (uses public router)
 * Permissions: None required
 * Method: GET /settings/theme
 */
export const get = publicRouter.settings.theme.get.handler(async () => {
  return getTheme();
});
