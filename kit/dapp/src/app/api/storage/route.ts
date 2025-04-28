import { deleteFile } from "@/lib/actions/delete-file";
import { NextRequest, NextResponse } from "next/server";

/**
 * API handler for deleting files from MinIO storage
 */
export async function DELETE(request: NextRequest) {
  // Extract fileId from URL parameters
  const url = new URL(request.url);
  const fileId = url.searchParams.get("fileId");

  if (!fileId) {
    console.error("Missing fileId parameter in request");
    return NextResponse.json(
      { error: "Missing required parameter: fileId" },
      { status: 400 }
    );
  }

  console.log(`API: Attempting to delete file with path: ${fileId}`);

  try {
    // Use our enhanced deleteFile function
    const result = await deleteFile(fileId);

    if (result.success) {
      console.log(`API: Successfully deleted file: ${fileId}`);
      return NextResponse.json({ success: true, message: result.message });
    } else {
      console.error(`API: Failed to delete file: ${fileId}`, result.message);
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error(`API: Error deleting file ${fileId}:`, error);
    return NextResponse.json(
      { error: "An error occurred while deleting the file" },
      { status: 500 }
    );
  }
}
