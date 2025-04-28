import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint for forcibly deleting files directly from MinIO with multiple fallbacks
 * Provides detailed logging for troubleshooting
 *
 * DELETE /api/diagnostics/force-delete?path=path/to/file.pdf
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

    console.log(`FORCE DELETE: Attempting to delete file: ${path}`);

    const response = {
      attempts: [] as {
        method: string;
        path: string;
        success: boolean;
        error?: string;
      }[],
      success: false,
      message: "",
      path,
    };

    // First attempt: Using MinIO client removeObject
    try {
      console.log(
        `FORCE DELETE: Attempt 1 - Using MinIO client with path: ${path}`
      );
      await minioClient.removeObject(DEFAULT_BUCKET, path);

      response.attempts.push({
        method: "minioClient.removeObject",
        path,
        success: true,
      });

      console.log(
        `FORCE DELETE: Success with minioClient.removeObject at path: ${path}`
      );
      response.success = true;
      response.message = "Successfully deleted with MinIO client";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `FORCE DELETE: minioClient.removeObject failed:`,
        errorMessage
      );

      response.attempts.push({
        method: "minioClient.removeObject",
        path,
        success: false,
        error: errorMessage,
      });
    }

    // If path contains slashes, try to delete just the filename
    if (!response.success && path.includes("/")) {
      const fileName = path.split("/").pop() || "";

      try {
        console.log(
          `FORCE DELETE: Attempt 2 - Using filename only: ${fileName}`
        );
        await minioClient.removeObject(DEFAULT_BUCKET, fileName);

        response.attempts.push({
          method: "minioClient.removeObject",
          path: fileName,
          success: true,
        });

        console.log(
          `FORCE DELETE: Success with minioClient.removeObject at path: ${fileName}`
        );
        response.success = true;
        response.message = "Successfully deleted using filename only";
      } catch (error3) {
        const errorMessage3 =
          error3 instanceof Error ? error3.message : String(error3);

        response.attempts.push({
          method: "minioClient.removeObject",
          path: fileName,
          success: false,
          error: errorMessage3,
        });
      }
    }

    // If the path is regulations/mica/file.pdf, try just mica/file.pdf
    if (!response.success && path.startsWith("regulations/mica/")) {
      const micaPath = path.replace("regulations/mica/", "mica/");

      try {
        console.log(`FORCE DELETE: Attempt 3 - Using mica path: ${micaPath}`);
        await minioClient.removeObject(DEFAULT_BUCKET, micaPath);

        response.attempts.push({
          method: "minioClient.removeObject",
          path: micaPath,
          success: true,
        });

        console.log(
          `FORCE DELETE: Success with minioClient.removeObject at path: ${micaPath}`
        );
        response.success = true;
        response.message = "Successfully deleted using mica path";
      } catch (error4) {
        const errorMessage4 =
          error4 instanceof Error ? error4.message : String(error4);

        response.attempts.push({
          method: "minioClient.removeObject",
          path: micaPath,
          success: false,
          error: errorMessage4,
        });
      }
    }

    // If the path is regulations/mica/file.pdf, try mica-file.pdf (flattened)
    if (!response.success && path.includes("/")) {
      const flatPath = path.replace(/\//g, "-");

      try {
        console.log(
          `FORCE DELETE: Attempt 4 - Using flattened path: ${flatPath}`
        );
        await minioClient.removeObject(DEFAULT_BUCKET, flatPath);

        response.attempts.push({
          method: "minioClient.removeObject",
          path: flatPath,
          success: true,
        });

        console.log(
          `FORCE DELETE: Success with minioClient.removeObject at path: ${flatPath}`
        );
        response.success = true;
        response.message = "Successfully deleted using flattened path";
      } catch (error5) {
        const errorMessage5 =
          error5 instanceof Error ? error5.message : String(error5);

        response.attempts.push({
          method: "minioClient.removeObject",
          path: flatPath,
          success: false,
          error: errorMessage5,
        });
      }
    }

    // Attempt to list files to see if the object still exists
    console.log(
      `FORCE DELETE: Verifying deletion by checking if file still exists`
    );
    let fileStillExists = false;

    try {
      await minioClient.statObject(DEFAULT_BUCKET, path);
      fileStillExists = true;
      console.log(`FORCE DELETE: File still exists at path: ${path}`);
    } catch (statError) {
      // Expected - file should be gone
      console.log(`FORCE DELETE: File does not exist at path: ${path}`);
      fileStillExists = false;

      // This means deletion succeeded even if our methods reported failure
      if (!response.success) {
        response.success = true;
        response.message =
          "Verified file is deleted, even though explicit delete methods failed";
      }
    }

    // Final verification
    response.success = response.success || !fileStillExists;

    if (!response.success) {
      response.message = "All deletion attempts failed";
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in force-delete:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        attempts: [],
      },
      { status: 500 }
    );
  }
}
