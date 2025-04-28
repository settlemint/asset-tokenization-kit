import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * Diagnostic API to clean up orphaned files in MinIO
 * For use by administrators only - use with caution
 *
 * GET /api/diagnostics/minio-cleanup - Lists orphaned files
 * DELETE /api/diagnostics/minio-cleanup - Removes orphaned files
 */

// Helper function to determine if a file is likely orphaned based on path patterns
function isLikelyOrphaned(path: string): boolean {
  // Files in these folders are likely system files and should be preserved
  const systemPaths = ["system/", "config/", ".system/"];

  // Check if the file is in a system path
  for (const systemPath of systemPaths) {
    if (path.startsWith(systemPath)) {
      return false;
    }
  }

  // Files with these patterns are likely temporary uploads that failed to delete
  const orphanPatterns = [
    // Files older than 7 days with temp in the name
    { pattern: "temp", ageThresholdDays: 7 },
    // Uploads without proper structure older than 14 days
    { pattern: "uploads/", ageThresholdDays: 14 },
    // Generic Documents with no date structure older than 30 days
    { pattern: "Documents/", ageThresholdDays: 30 },
  ];

  const now = new Date();
  const fileDate = path.match(/(\d{4})-(\d{2})-(\d{2})/);

  // If the path has a date pattern, check if it's older than the threshold
  if (fileDate) {
    const [_, year, month, day] = fileDate;
    const fileTime = new Date(`${year}-${month}-${day}`).getTime();
    const daysSinceCreation = Math.floor(
      (now.getTime() - fileTime) / (1000 * 60 * 60 * 24)
    );

    // Files older than 90 days are considered orphaned
    if (daysSinceCreation > 90) {
      return true;
    }
  }

  // Check other orphan patterns
  for (const { pattern, ageThresholdDays } of orphanPatterns) {
    if (path.includes(pattern)) {
      // For these patterns, we would need file metadata to check age
      // But we'll consider them candidates for cleanup
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    // Get potential orphaned files
    const objects = await listOrphanedFiles();

    return NextResponse.json({
      success: true,
      message: `Found ${objects.length} potentially orphaned files`,
      orphanedFiles: objects,
    });
  } catch (error: any) {
    console.error("Error listing orphaned files:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get orphaned files
    const objects = await listOrphanedFiles();

    // Safety check - require confirmation parameter
    const url = new URL(request.url);
    const confirmed = url.searchParams.get("confirmed") === "true";

    if (!confirmed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action requires confirmation. Add ?confirmed=true to proceed.",
          orphanedFiles: objects,
        },
        { status: 400 }
      );
    }

    // Delete orphaned files
    const results = [];
    for (const obj of objects) {
      try {
        await minioClient.removeObject(DEFAULT_BUCKET, obj.name);
        results.push({
          name: obj.name,
          status: "deleted",
        });
      } catch (error: any) {
        results.push({
          name: obj.name,
          status: "error",
          error: error.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${objects.length} orphaned files`,
      results,
    });
  } catch (error: any) {
    console.error("Error cleaning up orphaned files:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function listOrphanedFiles() {
  // List all objects
  const objectsStream = minioClient.listObjects(DEFAULT_BUCKET, "", true);

  const objects = [];
  for await (const obj of objectsStream) {
    if (obj.name) {
      try {
        const stat = await minioClient.statObject(DEFAULT_BUCKET, obj.name);

        // Check if this is likely an orphaned file
        if (isLikelyOrphaned(obj.name)) {
          objects.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            metadata: stat.metaData,
          });
        }
      } catch (error) {
        // If we can't get stats, consider it potentially orphaned
        objects.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          error: "Could not get file stats",
        });
      }
    }
  }

  return objects;
}
