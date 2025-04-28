import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * Basic test endpoint for MinIO file deletion without any abstraction
 *
 * DELETE /api/test-minio-delete?path=regulations/mica/sdf.pdf
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing path parameter",
        },
        { status: 400 }
      );
    }

    console.log(`TEST MINIO DELETE: Attempting direct deletion of: ${path}`);
    console.log(`TEST MINIO DELETE: Using bucket: ${DEFAULT_BUCKET}`);

    try {
      // Direct MinIO client call with no abstraction
      await minioClient.removeObject(DEFAULT_BUCKET, path);
      console.log(`TEST MINIO DELETE: Successfully deleted file: ${path}`);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted file: ${path}`,
        path: path,
        bucket: DEFAULT_BUCKET,
      });
    } catch (error) {
      console.error(`TEST MINIO DELETE: Error deleting file:`, error);

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        path: path,
        bucket: DEFAULT_BUCKET,
      });
    }
  } catch (error) {
    console.error("Error in test-minio-delete:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
