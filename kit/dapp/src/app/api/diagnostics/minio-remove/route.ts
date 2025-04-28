import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * Diagnostic API endpoint to force-remove a file from MinIO
 * Use with caution - this is a maintenance tool for removing problematic files
 *
 * DELETE /api/diagnostics/minio-remove?path=path/to/file
 */
export async function DELETE(request: NextRequest) {
  try {
    // Extract the path from query parameters
    const url = new URL(request.url);
    const path = url.searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required 'path' parameter",
        },
        { status: 400 }
      );
    }

    console.log(
      `Force removing file at path: ${path} from bucket: ${DEFAULT_BUCKET}`
    );

    // First check if the file exists
    let fileExists = false;
    try {
      const stat = await minioClient.statObject(DEFAULT_BUCKET, path);
      fileExists = true;
      console.log(
        `File exists with size: ${stat.size}, last modified: ${stat.lastModified}`
      );
    } catch (error: any) {
      console.log(
        `File does not exist or error checking: ${error.message || error}`
      );
    }

    if (!fileExists) {
      return NextResponse.json(
        {
          success: false,
          message: `File ${path} does not exist in bucket ${DEFAULT_BUCKET}`,
          fileExists: false,
        },
        { status: 404 }
      );
    }

    // Attempt to remove the object
    await minioClient.removeObject(DEFAULT_BUCKET, path);

    // Verify it's been removed
    let stillExists = false;
    try {
      await minioClient.statObject(DEFAULT_BUCKET, path);
      stillExists = true;
    } catch (error) {
      // This is the expected outcome - file should be gone
      stillExists = false;
    }

    if (stillExists) {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to delete ${path}, file still exists after deletion attempt`,
          fileExists: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${path} from bucket ${DEFAULT_BUCKET}`,
      fileExists: false,
    });
  } catch (error: any) {
    console.error("Error in force remove operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
