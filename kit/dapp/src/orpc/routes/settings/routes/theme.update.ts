import {
  getTheme,
  updateTheme,
  ThemeVersionConflictError,
} from "@/components/theme/lib/repository";
import {
  sanitizeThemeForValidation,
  validateThemeLimits,
} from "@/components/theme/lib/validation";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import {
  recordThemeUpdateMetric,
  startThemeMetricTimer,
} from "@/lib/observability/theme.metrics";

/**
 * Theme update route handler.
 *
 * Updates the theme configuration in the database.
 * Increments version and updates metadata.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "upsert" permission for settings
 * Method: POST /settings/theme
 */
export const update = authRouter.settings.theme.update
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["upsert"] },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const stopTimer = startThemeMetricTimer();
    const userId = context.auth?.user?.id;

    if (!userId) {
      recordThemeUpdateMetric({
        durationMs: stopTimer(),
        success: false,
      });
      throw errors.USER_NOT_AUTHORIZED({
        message: "Authentication required to update theme configuration",
        data: {
          requiredRoles: { any: ["setting:upsert"] },
        },
      });
    }

    const currentTheme = await getTheme();

    if (input.metadata.version !== currentTheme.metadata.version) {
      recordThemeUpdateMetric({
        durationMs: stopTimer(),
        success: false,
      });
      throw errors.CONFLICT({
        message:
          "Theme has been updated since you last fetched it. Refresh and try again.",
        data: {
          expectedVersion: currentTheme.metadata.version,
          receivedVersion: input.metadata.version,
        },
      });
    }

    const payload = sanitizeThemeForValidation(input);
    const violations = validateThemeLimits(payload);
    if (violations.length > 0) {
      recordThemeUpdateMetric({
        durationMs: stopTimer(),
        success: false,
      });
      throw errors.BAD_REQUEST({
        message: "Theme payload exceeds supported limits",
        data: { violations },
      });
    }

    const updatedBy = userId;
    try {
      const theme = await updateTheme(payload, updatedBy);
      recordThemeUpdateMetric({
        durationMs: stopTimer(),
        success: true,
      });
      return {
        theme,
        success: true,
      };
    } catch (error) {
      recordThemeUpdateMetric({
        durationMs: stopTimer(),
        success: false,
      });
      if (error instanceof ThemeVersionConflictError) {
        throw errors.CONFLICT({
          message:
            "Theme has been updated since you last fetched it. Refresh and try again.",
          data: {
            expectedVersion: currentTheme.metadata.version,
            receivedVersion: input.metadata.version,
          },
        });
      }
      throw error;
    }
  });
