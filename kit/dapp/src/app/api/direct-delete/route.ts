import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * Direct deletion API endpoint for reliably deleting files from MinIO
 * Tries multiple path variants to ensure deletion success
 *
 * DELETE /api/direct-delete?path=path/to/file.pdf
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path");
    const type = url.searchParams.get("type");

    if (!path) {
      console.error("DIRECT DELETE API: Missing path parameter");
      return NextResponse.json(
        {
          success: false,
          error: "Missing path parameter",
        },
        { status: 400 }
      );
    }

    console.log(
      `DIRECT DELETE API: Request received to delete file: ${path} with type: ${type || "unknown"}`
    );
    console.log(`DIRECT DELETE API: Full request URL: ${request.url}`);
    console.log(`DIRECT DELETE API: Using bucket: ${DEFAULT_BUCKET}`);

    // Generate possible path variations
    const pathsToTry = generatePathVariations(path, type);
    console.log(`DIRECT DELETE API: Will try these paths:`, pathsToTry);

    // Try each path in sequence
    const results = [];
    let success = false;

    for (const attemptPath of pathsToTry) {
      try {
        console.log(`DIRECT DELETE: Trying path: ${attemptPath}`);
        await minioClient.removeObject(DEFAULT_BUCKET, attemptPath);

        // Verify deletion
        let fileExists = false;
        try {
          await minioClient.statObject(DEFAULT_BUCKET, attemptPath);
          fileExists = true;
        } catch (e) {
          // Expected error - file should be gone
          fileExists = false;
        }

        results.push({
          path: attemptPath,
          success: !fileExists,
          verified: true,
        });

        if (!fileExists) {
          console.log(`DIRECT DELETE: Successfully deleted: ${attemptPath}`);
          success = true;
          // Don't break, attempt all paths to clean up any duplicates
        } else {
          console.log(
            `DIRECT DELETE: Path was found but not deleted: ${attemptPath}`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(
          `DIRECT DELETE: Error with path ${attemptPath}: ${errorMessage}`
        );

        results.push({
          path: attemptPath,
          success: false,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: success,
      message: success
        ? "Successfully deleted file"
        : "Failed to delete file with all path variations",
      originalPath: path,
      results: results,
    });
  } catch (error) {
    console.error("Error in direct-delete:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error in API handler",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate possible path variations for a file
 * This helps handle the different ways files might be stored in MinIO
 */
function generatePathVariations(path: string, type?: string | null): string[] {
  const variations = [path]; // Start with the original path

  // Extract filename from path
  const fileName = path.split("/").pop() || path;

  // For MiCA/regulations documents
  if (type === "mica" || type === "regulations") {
    // Common paths for regulations documents
    variations.push(`regulations/mica/${fileName}`);
    variations.push(`mica/${fileName}`);

    // If the path already has regulations/mica, try without it
    if (path.startsWith("regulations/mica/")) {
      variations.push(path.replace("regulations/mica/", ""));
    }

    // If the path doesn't have regulations/mica, try with it
    if (!path.includes("regulations/mica")) {
      variations.push(`regulations/mica/${path}`);
    }
  }

  // Always try the raw filename as fallback
  variations.push(fileName);

  // Try with standard file extensions if they're missing
  if (!fileName.includes(".")) {
    variations.push(`${fileName}.pdf`);
    variations.push(`${fileName}.txt`);
    variations.push(`${fileName}.docx`);
  }

  // Remove duplicates
  return [...new Set(variations)];
}
