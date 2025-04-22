import { uploadToStorage } from "@/lib/actions/upload";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API route handler for file uploads
 *
 * Note: This API route is kept for backward compatibility.
 * For new code, use the uploadToStorage server action directly.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const path = (formData.get("path") as string) || "";

    if (!formData.has("file")) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    try {
      // Use the server action to handle the upload
      const result = await uploadToStorage(formData, path);

      console.log(`File uploaded successfully via API: ${result.objectName}`);

      return NextResponse.json({
        success: true,
        file: result,
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error in /api/upload POST:", error);
      return NextResponse.json(
        {
          error: "Failed to upload file",
          details:
            process.env.NODE_ENV === "development"
              ? (error as Error).message
              : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
