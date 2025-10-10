import { branding, DEFAULT_BRANDING } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

/**
 * Get the current branding configuration.
 *
 * Returns the branding settings from the database, or creates a default
 * configuration if none exists yet.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission for branding
 * Method: GET /branding
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<BrandingOutput> - The current branding configuration
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If the database operation fails
 * @example
 * ```typescript
 * // Client usage:
 * const brandingConfig = await orpc.branding.read.query();
 * console.log(brandingConfig.applicationTitle);
 * ```
 */
export const read = authRouter.branding.read
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { branding: ["read"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, errors }) => {
    logger.info("[Branding] Reading branding configuration");

    // Get the first (and should be only) branding configuration
    const brandingConfig = await context.db.query.branding.findFirst();

    // If no branding exists, create one with defaults
    if (!brandingConfig) {
      logger.info(
        "[Branding] No branding found, creating default configuration"
      );

      const [newBranding] = await context.db
        .insert(branding)
        .values({
          ...DEFAULT_BRANDING,
        })
        .returning();

      if (!newBranding) {
        logger.error("[Branding] Failed to create default branding");
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Failed to create default branding configuration",
        });
      }

      logger.info("[Branding] Default branding created successfully", {
        id: newBranding.id,
      });
      return newBranding;
    }

    logger.info("[Branding] Branding configuration found", {
      id: brandingConfig.id,
    });
    return brandingConfig;
  });
