import {
  createPresignedUploadUrl,
  deleteFile,
  getFileById,
  getFilesList,
  uploadFile,
} from "@/lib/queries/storage/file-storage";
import { NextRequest, NextResponse } from "next/server";

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
      const files = await getFilesList(prefix || "");
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
 * POST handler for uploading files
 *
 * Example usage with curl:
 * curl -X POST -F "file=@./my-image.jpg" -F "path=images/" http://localhost:3000/api/storage
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = (formData.get("path") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadFile(file, path);
    if (!result) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Return the file metadata for immediate UI update
    return NextResponse.json({
      success: true,
      file: result,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Storage API error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
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
