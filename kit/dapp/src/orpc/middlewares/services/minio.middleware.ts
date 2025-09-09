import { client as minioClient } from "@/lib/settlemint/minio";
import type { Context } from "@/orpc/context/context";
import { baseRouter } from "../../procedures/base.router";

/**
 * ORPC middleware that injects the MinIO client into the procedure context.
 *
 * This middleware provides access to MinIO object storage functionality,
 * enabling procedures to upload, download, and manage files in S3-compatible storage.
 * @remarks
 * - Uses dependency injection pattern to allow overriding in tests
 * - Falls back to the default minioClient if none provided in context
 * - Essential for procedures that handle file uploads, document storage, or media management
 * @example
 * ```typescript
 * const uploadProcedure = pr
 *   .use(minioMiddleware)
 *   .mutation(async ({ context, input }) => {
 *     // context.minioClient is now available
 *     await context.minioClient.putObject('bucket', 'file.pdf', buffer);
 *   });
 * ```
 */
export const minioMiddleware = baseRouter.middleware<
  Pick<Context, "minioClient">,
  unknown
>(async ({ context, next }) => {
  return next({
    context: {
      // Use existing MinIO client if available (e.g., for testing),
      // otherwise inject the default MinIO client instance
      minioClient: context.minioClient ?? minioClient,
    },
  });
});
