import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { minioMiddleware } from "@/orpc/middlewares/services/minio.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { Readable } from "node:stream";

const logger = createLogger();

// MinIO bucket name for branding assets
const BRANDING_BUCKET = "branding";

/**
 * Upload an image to MinIO for branding purposes.
 *
 * Accepts a base64 encoded image, uploads it to MinIO S3 storage,
 * and returns the public URL for use in branding configuration.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "upload" permission for branding - admin only
 * Method: POST /branding/upload-image
 * @param input - Image data (base64), filename, mime type, and image type
 * @param context - Request context with MinIO client and authenticated user
 * @returns Promise<{ url: string, imageType: string }> - Public URL of uploaded image
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required upload permissions
 * @throws INTERNAL_SERVER_ERROR - If the upload operation fails
 * @example
 * ```typescript
 * // Client usage:
 * const result = await orpc.branding.uploadImage.mutate({
 *   imageData: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
 *   fileName: 'logo.png',
 *   mimeType: 'image/png',
 *   imageType: 'logo_main',
 * });
 * console.log(result.url); // https://minio.example.com/branding/logo_main.png
 * ```
 */
export const uploadImage = authRouter.branding.uploadImage
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { branding: ["upload"] },
    })
  )
  .use(minioMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { imageData, fileName, mimeType, imageType } = input;

    logger.info("[Branding] Starting image upload to MinIO", {
      fileName,
      mimeType,
      imageType,
      userId: context.user?.id,
      imageDataLength: imageData?.length || 0,
      hasMinioClient: !!context.minioClient,
    });

    if (!context.minioClient) {
      logger.error("[Branding] MinIO client not available in context");
      throw errors.INTERNAL_SERVER_ERROR({
        message: "MinIO client not initialized",
      });
    }

    try {
      // Ensure bucket exists
      logger.info("[Branding] Checking if bucket exists", {
        bucket: BRANDING_BUCKET,
      });
      const bucketExists =
        await context.minioClient.bucketExists(BRANDING_BUCKET);

      if (!bucketExists) {
        logger.info("[Branding] Creating branding bucket", {
          bucket: BRANDING_BUCKET,
        });
        await context.minioClient.makeBucket(BRANDING_BUCKET);

        // Set bucket policy to public read
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${BRANDING_BUCKET}/*`],
            },
          ],
        };
        await context.minioClient.setBucketPolicy(
          BRANDING_BUCKET,
          JSON.stringify(policy)
        );
      }

      // Remove data URL prefix if present
      logger.info("[Branding] Processing image data");
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      logger.info("[Branding] Image buffer created", {
        bufferSize: buffer.length,
        sizeKB: Math.round(buffer.length / 1024),
      });

      // Generate object name based on image type and timestamp
      const timestamp = Date.now();
      const extension = fileName.split(".").pop() || "png";
      const objectName = `${imageType}_${timestamp}.${extension}`;

      logger.info("[Branding] Generated object name", {
        objectName,
        extension,
      });

      // Upload to MinIO
      logger.info("[Branding] Uploading to MinIO", {
        objectName,
        size: buffer.length,
      });

      const stream = Readable.from(buffer);
      await context.minioClient.putObject(
        BRANDING_BUCKET,
        objectName,
        stream,
        buffer.length,
        {
          "Content-Type": mimeType,
        }
      );

      // Generate public URL
      let minioEndpoint = process.env.SETTLEMINT_MINIO_ENDPOINT;
      if (!minioEndpoint) {
        logger.error("[Branding] MinIO endpoint not configured");
        throw errors.INTERNAL_SERVER_ERROR({
          message: "MinIO endpoint not configured",
        });
      }

      // Remove s3:// prefix if present
      minioEndpoint = minioEndpoint.replace(/^s3:\/\//, "");

      const protocol = minioEndpoint.includes("localhost") ? "http" : "https";
      const url = `${protocol}://${minioEndpoint}/${BRANDING_BUCKET}/${objectName}`;

      logger.info("[Branding] Generated public URL", {
        url,
        endpoint: minioEndpoint,
        rawEndpoint: process.env.SETTLEMINT_MINIO_ENDPOINT,
      });

      logger.info("[Branding] Image uploaded successfully", {
        url,
        objectName,
      });

      return {
        url,
        imageType,
      };
    } catch (error) {
      logger.error("[Branding] Failed to upload image to MinIO", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorCode: (error as any)?.code,
        imageType,
        fileName,
        bucketName: BRANDING_BUCKET,
      });
      throw errors.INTERNAL_SERVER_ERROR({
        message: `Failed to upload image: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });
