import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextResponse } from "next/server";

/**
 * Diagnostic API endpoint to list all files in a MinIO bucket
 * Use with caution - lists all files with extensive details
 *
 * This route can be used to identify files that may be difficult to delete
 * GET /api/diagnostics/minio-files?prefix=your/path (optional prefix parameter)
 */
export async function GET(request: Request) {
  try {
    // Extract optional prefix from query parameters
    const url = new URL(request.url);
    const prefix = url.searchParams.get("prefix") || "";

    // Collect configuration info
    const endpoint = process.env.SETTLEMINT_MINIO_ENDPOINT || "";
    const accessKey = process.env.SETTLEMINT_MINIO_ACCESS_KEY || "";
    const hasSecretKey = !!process.env.SETTLEMINT_MINIO_SECRET_KEY;

    // Get bucket info
    let bucketExists = false;
    try {
      bucketExists = await minioClient.bucketExists(DEFAULT_BUCKET);
    } catch (error) {
      console.error("Error checking bucket existence:", error);
    }

    if (!bucketExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Bucket ${DEFAULT_BUCKET} does not exist`,
          config: {
            endpoint: endpoint ? endpoint.substring(0, 20) + "..." : "Not set",
            hasAccessKey: !!accessKey,
            hasSecretKey: hasSecretKey,
            bucket: DEFAULT_BUCKET,
          },
        },
        { status: 404 }
      );
    }

    // List objects with the provided prefix
    console.log(
      `Listing objects in bucket '${DEFAULT_BUCKET}' with prefix '${prefix}'`
    );
    const objectsStream = minioClient.listObjects(DEFAULT_BUCKET, prefix, true);

    const files = [];
    for await (const obj of objectsStream) {
      if (obj.name) {
        // Get detailed object info
        try {
          const stat = await minioClient.statObject(DEFAULT_BUCKET, obj.name);

          // Generate a temporary URL for this object
          const url = await minioClient.presignedGetObject(
            DEFAULT_BUCKET,
            obj.name,
            3600 // 1 hour expiry
          );

          files.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            etag: obj.etag,
            metadata: stat.metaData,
            url: url,
          });
        } catch (statError: any) {
          // Include files even if we can't get detailed stats
          files.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            etag: obj.etag,
            metadata: "Error retrieving metadata",
            error: statError.message || "Unknown error",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      bucket: DEFAULT_BUCKET,
      prefix: prefix,
      fileCount: files.length,
      config: {
        endpoint: endpoint ? endpoint.substring(0, 20) + "..." : "Not set",
        hasAccessKey: !!accessKey,
        hasSecretKey: hasSecretKey,
      },
      files: files,
    });
  } catch (error: any) {
    console.error("Error in MinIO diagnostics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
