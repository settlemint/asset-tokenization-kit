import {
  createPresignedUploadUrl,
  deleteFile,
  getFileById,
  getFilesList,
  uploadFile,
} from "@/lib/queries/storage/file-storage";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * GET handler for listing or fetching files
 *
 * Example usage:
 * - GET /api/storage?prefix=images/  - Lists all files in 'images/' directory
 * - GET /api/storage?fileId=images/logo.png - Gets a specific file metadata
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix");
  const fileId = searchParams.get("fileId");
  const skipCache = searchParams.get("skipCache") === "true";

  try {
    if (fileId) {
      // Fetch a specific file
      const file = await getFileById(fileId);
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      return NextResponse.json(file);
    } else {
      // List files with optional prefix
      const files = await getFilesList(prefix || "", skipCache);
      return NextResponse.json({ files });
    }
  } catch (error) {
    console.error("Storage API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for uploading files - Reverted to use uploadFile
 */
export async function POST(request: NextRequest) {
  console.log("--- POST /api/storage using uploadFile --- ");
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = (formData.get("path") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Calling uploadFile for: ${file.name}, Path: '${path}'`);
    // Use the uploadFile function which internally uses fPutObject now
    const result = await uploadFile(file, path);

    if (!result) {
      console.error("uploadFile function returned null or undefined");
      return NextResponse.json(
        { error: "Failed to upload file using uploadFile function" },
        { status: 500 }
      );
    }

    console.log("uploadFile successful, result:", result);
    // Return the file metadata for immediate UI update
    return NextResponse.json({
      success: true,
      file: result,
      message: "File uploaded successfully",
    });
  } catch (error) {
    // Log the specific error from uploadFile or its dependencies
    console.error("--- Error in /api/storage POST via uploadFile ---", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        // Optionally include error details in development
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing files
 *
 * Example usage with curl:
 * curl -X DELETE http://localhost:3000/api/storage?fileId=images/my-image.jpg
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "No file ID provided" }, { status: 400 });
  }

  try {
    const success = await deleteFile(fileId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Storage API error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for getting a presigned upload URL
 *
 * Example usage with curl:
 * curl -X PATCH -H "Content-Type: application/json" -d '{"fileName":"my-image.jpg","contentType":"image/jpeg","path":"images/"}' http://localhost:3000/api/storage
 */
export async function PATCH(request: NextRequest) {
  try {
    const { fileName, contentType, path, expirySeconds } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const uploadUrl = await createPresignedUploadUrl(
      fileName,
      contentType,
      path || "",
      expirySeconds || 3600
    );

    if (!uploadUrl) {
      return NextResponse.json(
        { error: "Failed to generate upload URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error("Storage API error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
