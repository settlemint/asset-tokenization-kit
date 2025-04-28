import { deleteFile } from "@/lib/actions/delete-file";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint for deleting files by exact path
 *
 * DELETE /api/diagnostics/delete-file-by-path?path=regulations/mica/test1.pdf
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

    console.log(`Deleting file by path: ${path}`);
    const result = await deleteFile(path);

    return NextResponse.json({
      ...result,
      path,
    });
  } catch (error: any) {
    console.error("Error in delete-file-by-path:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
