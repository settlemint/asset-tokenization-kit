import { deleteFile } from "@/lib/actions/delete-file";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint for testing file deletion with our consolidated function
 */
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const fileId = url.searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json(
      { error: "Missing fileId parameter" },
      { status: 400 }
    );
  }

  console.log(`Test Delete API: Attempting to delete: ${fileId}`);

  try {
    const result = await deleteFile(fileId);

    return NextResponse.json({
      ...result,
      testedFile: fileId,
    });
  } catch (error) {
    console.error("Unexpected error in test-delete API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error in API handler",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
