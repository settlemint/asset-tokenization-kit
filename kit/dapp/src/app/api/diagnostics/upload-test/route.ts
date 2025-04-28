import { uploadFile } from "@/lib/queries/storage/file-storage";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test API endpoint for uploading files with detailed logging
 * POST /api/diagnostics/upload-test
 *
 * Body: FormData with:
 * - file: The file to upload
 * - title: Document title
 * - description: Document description
 * - type: Document type (e.g., "regulations", "mica")
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Received file upload request");

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    // Log file details
    console.log(`Uploading test file:`, {
      name: file.name,
      type: file.type,
      size: file.size,
      documentType: type,
    });

    // Create path based on document type
    // Special case for regulations/mica path format to maintain consistency
    const basePath =
      type === "mica" || type === "regulations"
        ? "regulations/mica"
        : `Documents/${type}`;

    console.log(`Using upload path: ${basePath}`);

    // Upload the file
    const result = await uploadFile(file, basePath);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "File upload failed",
        },
        { status: 500 }
      );
    }

    console.log(`Upload successful:`, {
      id: result.id,
      path: basePath,
      fullPath: result.id,
      url: result.url
        ? result.url.length > 100
          ? result.url.substring(0, 100) + "..."
          : result.url
        : "none",
    });

    return NextResponse.json({
      success: true,
      file: {
        id: result.id,
        name: result.name,
        path: basePath,
        fullPath: result.id,
        url: result.url,
        size: result.size,
        contentType: result.contentType,
        uploadedAt: result.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("Error in upload-test:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
