import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * Diagnostic endpoint to help fix document paths
 * GET /api/diagnostics/fix-document-paths - List all documents and suggest correct paths
 * POST /api/diagnostics/fix-document-paths - Apply suggested fixes to specified documents
 */

// Helper function to extract the document type from a file path
function extractDocumentType(path: string): string | null {
  if (path.startsWith("Documents/")) {
    const parts = path.split("/");
    if (parts.length > 1) {
      return parts[1]; // 'Documents/type/...'
    }
  }

  if (path.startsWith("regulations/")) {
    return "regulations";
  }

  return null;
}

// Function to suggest the correct path for a document
function suggestCorrectPath(
  originalPath: string,
  fileName: string
): string | null {
  // Extract document type from original path if possible
  const docType = extractDocumentType(originalPath) || "other";

  // Get today's date in YYYY-MM-DD format for new document paths
  const now = new Date();
  const datePath = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Create structured path
  return `Documents/${docType}/${datePath}/${fileName}`;
}

export async function GET(request: NextRequest) {
  try {
    // List all objects in the bucket
    const objects = await listAllFiles();

    // Current date path for comparison
    const now = new Date();
    const currentDatePath = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // For each object, suggest a corrected path if needed
    const suggestions = objects.map((obj) => {
      const fileName = obj.name.split("/").pop() || obj.name;
      const suggestedPath = suggestCorrectPath(obj.name, fileName);

      return {
        currentPath: obj.name,
        fileName: fileName,
        type: extractDocumentType(obj.name) || "unknown",
        suggestedPath: suggestedPath,
        needsFixing:
          obj.name !== suggestedPath &&
          (obj.name.startsWith("regulations/") ||
            !obj.name.includes(currentDatePath)),
      };
    });

    // Only include objects that need fixing
    const needFixing = suggestions.filter((s) => s.needsFixing);

    return NextResponse.json({
      success: true,
      totalFiles: objects.length,
      needFixing: needFixing.length,
      suggestions: needFixing,
    });
  } catch (error: any) {
    console.error("Error in fix-document-paths:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pathsToFix = body.paths || [];

    if (!pathsToFix || !Array.isArray(pathsToFix) || pathsToFix.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No paths provided to fix",
        },
        { status: 400 }
      );
    }

    const results = [];

    // Process each path
    for (const item of pathsToFix) {
      const { currentPath, suggestedPath } = item;

      if (!currentPath || !suggestedPath) {
        results.push({
          currentPath,
          success: false,
          message: "Missing currentPath or suggestedPath",
        });
        continue;
      }

      try {
        // Copy the object to the new path
        await minioClient.copyObject(
          DEFAULT_BUCKET, // destination bucket
          suggestedPath, // destination object name
          `${DEFAULT_BUCKET}/${currentPath}` // source object
        );

        // Delete the original object
        await minioClient.removeObject(DEFAULT_BUCKET, currentPath);

        results.push({
          currentPath,
          suggestedPath,
          success: true,
          message: "File path corrected successfully",
        });
      } catch (fixError: any) {
        results.push({
          currentPath,
          suggestedPath,
          success: false,
          message: fixError.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error fixing document paths:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function listAllFiles() {
  // List all objects in the bucket
  const objectsStream = minioClient.listObjects(DEFAULT_BUCKET, "", true);

  const objects = [];
  for await (const obj of objectsStream) {
    if (obj.name) {
      try {
        const stat = await minioClient.statObject(DEFAULT_BUCKET, obj.name);

        objects.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          metadata: stat.metaData,
        });
      } catch (error) {
        // Include even if we can't get stats
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
