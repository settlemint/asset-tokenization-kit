import { branding } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { eq } from "drizzle-orm";

const logger = createLogger();

/**
 * Update or create branding configuration.
 *
 * Updates the existing branding configuration or creates a new one if it doesn't exist.
 * Only provided fields will be updated, allowing partial updates.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "upsert" permission for branding - admin only
 * Method: POST /branding
 * @param input - Branding data to update (partial updates supported)
 * @param context - Request context with database connection and authenticated user
 * @returns Promise<BrandingOutput> - The updated branding configuration
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required update permissions
 * @throws INTERNAL_SERVER_ERROR - If the database operation fails
 * @example
 * ```typescript
 * // Client usage:
 * const updated = await orpc.branding.upsert.mutate({
 *   applicationTitle: 'My Custom Platform',
 *   colorPrimary: 'oklch(0.6 0.2 280)',
 * });
 * console.log(updated.applicationTitle);
 * ```
 */
export const upsert = authRouter.branding.upsert
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { branding: ["upsert"] },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ input, context, errors }) => {
    logger.info("[Branding] Upserting branding configuration", {
      fields: Object.keys(input),
      userId: context.user?.id,
      inputData: input,
    });

    try {
      // Get the first branding config (should be only one)
      const existingBranding = await context.db.query.branding.findFirst();
      logger.info("[Branding] Existing branding lookup result", {
        found: !!existingBranding,
        id: existingBranding?.id,
      });

      if (existingBranding) {
        // Update existing branding
        logger.info("[Branding] Updating existing branding", {
          id: existingBranding.id,
        });

        const [updatedBranding] = await context.db
          .update(branding)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(branding.id, existingBranding.id))
          .returning();

        if (!updatedBranding) {
          logger.error("[Branding] Failed to update branding", {
            id: existingBranding.id,
          });
          throw errors.INTERNAL_SERVER_ERROR({
            message: "Failed to update branding configuration",
          });
        }

        logger.info("[Branding] Branding updated successfully", {
          id: updatedBranding.id,
          fields: Object.keys(input),
        });
        return updatedBranding;
      } else {
        // Create new branding
        logger.info("[Branding] Creating new branding configuration");

        const [newBranding] = await context.db
          .insert(branding)
          .values({
            ...input,
          })
          .returning();

        if (!newBranding) {
          logger.error("[Branding] Failed to create branding");
          throw errors.INTERNAL_SERVER_ERROR({
            message: "Failed to create branding configuration",
          });
        }

        logger.info("[Branding] Branding created successfully", {
          id: newBranding.id,
        });
        return newBranding;
      }
    } catch (error) {
      logger.error("[Branding] Database error in upsert handler", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: context.user?.id,
      });
      throw errors.INTERNAL_SERVER_ERROR({
        message: `Failed to process branding request: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  });
